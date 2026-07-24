import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const isDryRun = process.argv.includes("--dry-run");
const productionSiteUrl = "https://mystockli.com";
const legacyProductionSiteUrl = "https://mystockli.qzz.io";
const localSiteUrl = "http://localhost:3001";

function stripEnvQuotes(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

async function loadDotEnv(relativePath) {
  try {
    const file = await readFile(path.join(repoRoot, relativePath), "utf8");
    for (const rawLine of file.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match) continue;
      const [, key, value] = match;
      if (!process.env[key]) process.env[key] = stripEnvQuotes(value);
    }
  } catch {
    // Optional local env file.
  }
}

function getEnv(name, fallback = "") {
  const raw = process.env[name];
  if (!raw) return fallback;
  return stripEnvQuotes(raw) || fallback;
}

function requireEnv(name) {
  const value = getEnv(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseProjectRef() {
  const explicit = getEnv("SUPABASE_PROJECT_REF");
  if (explicit) return explicit;

  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL").replace(/\/+$/, "");
  const match = supabaseUrl.match(/^https:\/\/([a-z0-9-]+)\.supabase\.co(?:\/.*)?$/i);
  if (!match) {
    throw new Error(
      "Unable to infer SUPABASE_PROJECT_REF from NEXT_PUBLIC_SUPABASE_URL. Set SUPABASE_PROJECT_REF explicitly."
    );
  }
  return match[1];
}

function maskSecret(value) {
  if (!value) return "(missing)";
  if (value.length <= 6) return "*".repeat(value.length);
  return `${value.slice(0, 2)}***${value.slice(-2)}`;
}

async function readTemplate(relativePath) {
  const filePath = path.join(repoRoot, relativePath);
  return readFile(filePath, "utf8");
}

async function main() {
  await loadDotEnv(".env.local");
  await loadDotEnv(".env");

  const projectRef = parseProjectRef();
  const smtpHost = getEnv("SUPABASE_AUTH_SMTP_HOST", "smtp-relay.brevo.com");
  const smtpPort = getEnv("SUPABASE_AUTH_SMTP_PORT", "587");
  const smtpUser = getEnv("SUPABASE_AUTH_SMTP_USER");
  const smtpPass = getEnv("SUPABASE_AUTH_SMTP_PASS");
  const smtpAdminEmail = getEnv("SUPABASE_AUTH_SMTP_ADMIN_EMAIL");
  // Always default to Stockli; override only via SUPABASE_AUTH_SMTP_SENDER_NAME.
  const smtpSenderName = getEnv("SUPABASE_AUTH_SMTP_SENDER_NAME", "Stockli");
  const rateLimitEmailSent = Number.parseInt(
    getEnv("SUPABASE_AUTH_RATE_LIMIT_EMAIL_SENT", "30"),
    10
  );
  const hasSmtpCredentials = Boolean(smtpUser && smtpPass && smtpAdminEmail);
  const otpExpirySeconds = Number.parseInt(getEnv("SUPABASE_AUTH_OTP_EXPIRY", "600"), 10);

  const confirmationTemplate = await readTemplate("supabase/templates/confirm-email.html");
  const recoveryTemplate = await readTemplate("supabase/templates/reset-password.html");
  const passwordChangedTemplate = await readTemplate(
    "supabase/templates/password-changed-notification.html"
  );

  const payload = {
    site_url: productionSiteUrl,
    additional_redirect_urls: [
      `${productionSiteUrl}/auth/callback`,
      `${productionSiteUrl}/auth/callback?next=/reset-password`,
      `https://www.mystockli.com/auth/callback`,
      `https://www.mystockli.com/auth/callback?next=/reset-password`,
      // Keep legacy hosts so older emails still complete while DNS cutover settles.
      `${legacyProductionSiteUrl}/auth/callback`,
      `${legacyProductionSiteUrl}/auth/callback?next=/reset-password`,
      `https://www.mystockli.qzz.io/auth/callback`,
      `https://www.mystockli.qzz.io/auth/callback?next=/reset-password`,
      `${localSiteUrl}/auth/callback`,
      `${localSiteUrl}/auth/callback?next=/reset-password`,
    ],
    external_email_enabled: true,
    mailer_autoconfirm: false,
    mailer_secure_email_change_enabled: true,
    smtp_sender_name: smtpSenderName,
    rate_limit_email_sent: rateLimitEmailSent,
    otp_expiry: Number.isFinite(otpExpirySeconds) ? otpExpirySeconds : 600,
    mailer_otp_length: 6,
    mailer_subjects_confirmation: "Your Stockli confirmation code",
    mailer_templates_confirmation_content: confirmationTemplate,
    mailer_subjects_recovery: "Your Stockli password reset code",
    mailer_templates_recovery_content: recoveryTemplate,
    mailer_notifications_password_changed_enabled: true,
    mailer_subjects_password_changed_notification: "Your Stockli password was changed",
    mailer_templates_password_changed_notification_content: passwordChangedTemplate,
  };

  if (hasSmtpCredentials) {
    payload.smtp_admin_email = smtpAdminEmail;
    payload.smtp_host = smtpHost;
    payload.smtp_port = smtpPort;
    payload.smtp_user = smtpUser;
    payload.smtp_pass = smtpPass;
  }

  if (isDryRun) {
    const missing = [];
    if (!getEnv("SUPABASE_ACCESS_TOKEN")) missing.push("SUPABASE_ACCESS_TOKEN");
    if (!hasSmtpCredentials) {
      missing.push(
        "SUPABASE_AUTH_SMTP_USER",
        "SUPABASE_AUTH_SMTP_PASS",
        "SUPABASE_AUTH_SMTP_ADMIN_EMAIL"
      );
    }

    console.log(
      JSON.stringify(
        {
          mode: "dry-run",
          projectRef,
          smtpMode: hasSmtpCredentials ? "update-smtp" : "templates-and-urls-only",
          smtp: {
            host: smtpHost,
            port: smtpPort,
            user: smtpUser || "(missing)",
            pass: maskSecret(smtpPass),
            adminEmail: smtpAdminEmail || "(missing)",
            senderName: smtpSenderName,
          },
          rateLimitEmailSent,
          otpExpirySeconds: Number.isFinite(otpExpirySeconds) ? otpExpirySeconds : 600,
          templates: {
            confirmationBytes: Buffer.byteLength(confirmationTemplate),
            recoveryBytes: Buffer.byteLength(recoveryTemplate),
            passwordChangedBytes: Buffer.byteLength(passwordChangedTemplate),
          },
          siteUrl: productionSiteUrl,
          additionalRedirectUrls: payload.additional_redirect_urls,
          missing,
          note: hasSmtpCredentials
            ? null
            : "SMTP credentials missing — apply will update templates, subjects, sender name, and redirect URLs only (existing SMTP settings stay as configured in Supabase).",
        },
        null,
        2
      )
    );
    return;
  }

  const accessToken = requireEnv("SUPABASE_ACCESS_TOKEN");

  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (compatible; StockliAuthEmailConfig/1.0; +https://mystockli.com)",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase auth config update failed (${response.status}): ${body}`);
  }

  const result = await response.json();
  console.log(
    JSON.stringify(
      {
        updated: true,
        projectRef,
        smtpMode: hasSmtpCredentials ? "update-smtp" : "templates-and-urls-only",
        smtpHost: hasSmtpCredentials ? smtpHost : "(unchanged)",
        smtpPort: hasSmtpCredentials ? smtpPort : "(unchanged)",
        smtpAdminEmail: hasSmtpCredentials ? smtpAdminEmail : "(unchanged)",
        smtpSenderName,
        otpExpirySeconds: result.otp_expiry ?? payload.otp_expiry,
        siteUrl: result.site_url ?? productionSiteUrl,
        additionalRedirectUrls: result.additional_redirect_urls ?? payload.additional_redirect_urls,
        confirmationSubject: result.mailer_subjects_confirmation,
        recoverySubject: result.mailer_subjects_recovery,
        passwordChangedSubject: result.mailer_subjects_password_changed_notification,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
