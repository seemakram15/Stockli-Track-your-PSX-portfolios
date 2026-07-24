"use server";

import { redirect } from "next/navigation";
import { isDemoMode, isSupabaseAdminConfigured } from "@/lib/config";
import {
  AUTH_UNAVAILABLE_MSG,
  ACCOUNT_DELETE_UNAVAILABLE_MSG,
} from "@/lib/user-messages";
import {
  enforceRateLimit,
  formatRetryAfter,
  getRequestClientIp,
  rateLimitKeyPart,
} from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/security/validation";
import { resolveRequestSiteUrl } from "@/lib/site-url";

export interface AuthState {
  error?: string;
  message?: string;
  email?: string;
  nextStep?: "confirm-signup" | "reset-email-sent" | "password-reset-complete";
}

export interface DeleteAccountState {
  error?: string;
}

const DEMO_MSG = AUTH_UNAVAILABLE_MSG;

const LOGIN_WINDOW_SECONDS = 10 * 60;
const EMAIL_FLOW_WINDOW_SECONDS = 30 * 60;
const OTP_VERIFY_WINDOW_SECONDS = 10 * 60;
const DELETE_ACCOUNT_WINDOW_SECONDS = 60 * 60;
const OTP_EXPIRY_MINUTES = 10;

type AuthErrorLike =
  | string
  | {
      message?: string;
      status?: number;
      name?: string;
    }
  | null
  | undefined;

function authErrorMessage(error: AuthErrorLike) {
  const message = typeof error === "string" ? error : error?.message ?? "";
  const status = typeof error === "object" && error ? error.status : undefined;
  const normalized = message.toLowerCase();
  if (!message || normalized === "{}" || normalized === "internal server error") {
    return "Something went wrong on our side. Please try again in a minute.";
  }
  if (status && status >= 500) {
    return "We couldn’t complete that request right now. Please try again shortly.";
  }
  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Too many attempts. Please wait a few minutes, then try again.";
  }
  if (
    normalized.includes("invalid login credentials") ||
    normalized.includes("invalid_credentials") ||
    normalized.includes("invalid email or password")
  ) {
    return "Your email or password is incorrect. Check both and try again.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Confirm your email first. Enter the 6-digit code we sent, then sign in.";
  }
  if (normalized.includes("user already registered")) {
    return "An account with this email already exists. Sign in, or reset your password if you forgot it.";
  }
  if (normalized.includes("password should be") || normalized.includes("password is known")) {
    return "Choose a stronger password (at least 8 characters).";
  }
  if (
    normalized.includes("otp_expired") ||
    normalized.includes("otp is invalid") ||
    normalized.includes("invalid otp") ||
    normalized.includes("token has expired") ||
    normalized.includes("email link is invalid") ||
    normalized.includes("token is expired")
  ) {
    return "That code is invalid or expired. Request a new one and try again within 10 minutes.";
  }
  // Never leak raw provider text to the UI.
  return "We couldn’t complete that. Please try again.";
}

async function findAuthUserByEmail(email: string) {
  if (!isSupabaseAdminConfigured) return null;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (error) return null;
    return data.users.find((user) => user.email?.toLowerCase() === email) ?? null;
  } catch {
    return null;
  }
}

async function resolveInvalidLoginMessage(email: string) {
  const matchingUser = await findAuthUserByEmail(email);
  if (!matchingUser) {
    return "No Stockli account found with this email.";
  }
  if (!matchingUser.email_confirmed_at) {
    return "This email isn’t confirmed yet. Enter the 6-digit code we sent, then sign in.";
  }
  return "Incorrect password. Try again, or reset your password.";
}

async function resolveAuthSiteUrl() {
  return resolveRequestSiteUrl();
}

function buildLoginUrl(
  siteUrl: string,
  message: string,
  email?: string | null,
  options?: { accountDeleted?: boolean }
) {
  const loginUrl = new URL("/login", siteUrl);
  loginUrl.searchParams.set("authMessage", message);
  if (email) loginUrl.searchParams.set("authEmail", email);
  if (options?.accountDeleted) loginUrl.searchParams.set("accountDeleted", "1");
  return loginUrl.toString();
}

async function checkAuthRateLimit(
  action:
    | "login"
    | "signup"
    | "resend-signup"
    | "forgot-password"
    | "verify-signup-otp"
    | "verify-recovery-otp",
  email: string
) {
  const ip = await getRequestClientIp();

  switch (action) {
    case "login":
      return enforceRateLimit({
        scope: "auth:login",
        windowSeconds: LOGIN_WINDOW_SECONDS,
        buckets: [
          { key: `ip:${rateLimitKeyPart(ip)}`, limit: 20 },
          { key: `ip-email:${rateLimitKeyPart(`${ip}:${email}`)}`, limit: 6 },
        ],
      });
    case "signup":
      return enforceRateLimit({
        scope: "auth:signup",
        windowSeconds: EMAIL_FLOW_WINDOW_SECONDS,
        buckets: [
          { key: `ip:${rateLimitKeyPart(ip)}`, limit: 8 },
          { key: `email:${rateLimitKeyPart(email)}`, limit: 3 },
        ],
      });
    case "resend-signup":
      return enforceRateLimit({
        scope: "auth:resend-signup",
        windowSeconds: EMAIL_FLOW_WINDOW_SECONDS,
        buckets: [
          { key: `ip:${rateLimitKeyPart(ip)}`, limit: 10 },
          { key: `email:${rateLimitKeyPart(email)}`, limit: 4 },
        ],
      });
    case "forgot-password":
      return enforceRateLimit({
        scope: "auth:forgot-password",
        windowSeconds: EMAIL_FLOW_WINDOW_SECONDS,
        buckets: [
          { key: `ip:${rateLimitKeyPart(ip)}`, limit: 10 },
          { key: `email:${rateLimitKeyPart(email)}`, limit: 5 },
        ],
      });
    case "verify-signup-otp":
    case "verify-recovery-otp":
      return enforceRateLimit({
        scope: `auth:${action}`,
        windowSeconds: OTP_VERIFY_WINDOW_SECONDS,
        buckets: [
          { key: `ip:${rateLimitKeyPart(ip)}`, limit: 20 },
          { key: `email:${rateLimitKeyPart(email)}`, limit: 10 },
        ],
      });
  }
}

function authRateLimitMessage(
  action:
    | "login"
    | "signup"
    | "resend-signup"
    | "forgot-password"
    | "verify-signup-otp"
    | "verify-recovery-otp",
  retryAfterSeconds: number
) {
  const wait = formatRetryAfter(retryAfterSeconds);
  if (action === "login") {
    return `Too many sign-in attempts. Please wait ${wait}, then try again.`;
  }
  if (action === "signup") {
    return `Too many sign-up attempts. Please wait ${wait}, then try again.`;
  }
  if (action === "resend-signup") {
    return `Too many code requests. Please wait ${wait} before asking for another.`;
  }
  if (action === "verify-signup-otp" || action === "verify-recovery-otp") {
    return `Too many code attempts. Please wait ${wait}, then try again.`;
  }
  return `Too many password reset requests. Please wait ${wait}, then try again.`;
}

function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeOtp(value: unknown) {
  return String(value ?? "").replace(/\D/g, "").slice(0, 6);
}

export async function signIn(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (isDemoMode) return { error: DEMO_MSG };

  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  if (!email && !password) {
    return { error: "Enter your email and password to sign in." };
  }
  if (!email) return { error: "Enter your email address." };
  if (!password) return { error: "Enter your password.", email };

  const rateLimit = await checkAuthRateLimit("login", email);
  if (!rateLimit.allowed) {
    return { error: authRateLimitMessage("login", rateLimit.retryAfterSeconds), email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const normalized = (error.message ?? "").toLowerCase();
    const invalidCredentials =
      normalized.includes("invalid login credentials") ||
      normalized.includes("invalid_credentials") ||
      normalized.includes("invalid email or password");

    if (invalidCredentials) {
      return { error: await resolveInvalidLoginMessage(email), email };
    }

    return { error: authErrorMessage(error), email };
  }

  redirect(safeRedirectPath(formData.get("redirectTo")));
}

export async function signUp(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (isDemoMode) return { error: DEMO_MSG };

  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!email && !password) {
    return { error: "Enter your name, email, and password to create an account." };
  }
  if (!email) return { error: "Enter your email address." };
  if (!password) return { error: "Choose a password.", email };
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters.", email };
  }

  const rateLimit = await checkAuthRateLimit("signup", email);
  if (!rateLimit.allowed) {
    return { error: authRateLimitMessage("signup", rateLimit.retryAfterSeconds), email };
  }

  const siteUrl = await resolveAuthSiteUrl();
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName || email.split("@")[0] },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });
  if (error) return { error: authErrorMessage(error) };

  return {
    email,
    nextStep: "confirm-signup",
  };
}

export async function resendSignupConfirmation(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (isDemoMode) return { error: DEMO_MSG };

  const email = normalizeEmail(formData.get("email"));
  if (!email) return { error: "Enter your email address.", nextStep: "confirm-signup" };

  const rateLimit = await checkAuthRateLimit("resend-signup", email);
  if (!rateLimit.allowed) {
    return {
      error: authRateLimitMessage("resend-signup", rateLimit.retryAfterSeconds),
      email,
      nextStep: "confirm-signup",
    };
  }

  const siteUrl = await resolveAuthSiteUrl();
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return {
      error: authErrorMessage(error),
      email,
      nextStep: "confirm-signup",
    };
  }

  return {
    email,
    message: "New code sent. Check your inbox — it expires in 10 minutes.",
    nextStep: "confirm-signup",
  };
}

export async function verifySignupOtp(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (isDemoMode) return { error: DEMO_MSG, nextStep: "confirm-signup" };

  const email = normalizeEmail(formData.get("email"));
  const token = normalizeOtp(formData.get("otp"));
  if (!email) return { error: "Enter your email address.", nextStep: "confirm-signup" };
  if (token.length !== 6) {
    return {
      error: "Enter the 6-digit confirmation code from your email.",
      email,
      nextStep: "confirm-signup",
    };
  }

  const rateLimit = await checkAuthRateLimit("verify-signup-otp", email);
  if (!rateLimit.allowed) {
    return {
      error: authRateLimitMessage("verify-signup-otp", rateLimit.retryAfterSeconds),
      email,
      nextStep: "confirm-signup",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });
  if (error) {
    return {
      error: authErrorMessage(error),
      email,
      nextStep: "confirm-signup",
    };
  }

  await supabase.auth.signOut();
  const siteUrl = await resolveAuthSiteUrl();
  redirect(
    buildLoginUrl(
      siteUrl,
      "Email verified. Sign in to open your Stockli portfolio.",
      email
    )
  );
}

export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (isDemoMode) return { error: DEMO_MSG };

  const email = normalizeEmail(formData.get("email"));
  if (!email) return { error: "Enter your email address." };

  const rateLimit = await checkAuthRateLimit("forgot-password", email);
  if (!rateLimit.allowed) {
    return {
      error: authRateLimitMessage("forgot-password", rateLimit.retryAfterSeconds),
      email,
    };
  }

  const genericResetMessage =
    "If this email has a Stockli account, we sent a 6-digit reset code. Check inbox and spam — it expires in 10 minutes.";
  const siteUrl = await resolveAuthSiteUrl();
  const matchingUser = await findAuthUserByEmail(email);

  if (matchingUser && !matchingUser.email_confirmed_at) {
    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (error) {
      return { error: authErrorMessage(error), email };
    }

    return {
      email,
      nextStep: "confirm-signup",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });

  if (error) return { error: authErrorMessage(error), email };

  return {
    email,
    message: genericResetMessage,
    nextStep: "reset-email-sent",
  };
}

export async function verifyRecoveryOtp(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (isDemoMode) return { error: DEMO_MSG, nextStep: "reset-email-sent" };

  const email = normalizeEmail(formData.get("email"));
  const token = normalizeOtp(formData.get("otp"));
  if (!email) return { error: "Enter your email address.", nextStep: "reset-email-sent" };
  if (token.length !== 6) {
    return {
      error: "Enter the 6-digit reset code from your email.",
      email,
      nextStep: "reset-email-sent",
    };
  }

  const rateLimit = await checkAuthRateLimit("verify-recovery-otp", email);
  if (!rateLimit.allowed) {
    return {
      error: authRateLimitMessage("verify-recovery-otp", rateLimit.retryAfterSeconds),
      email,
      nextStep: "reset-email-sent",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "recovery",
  });
  if (error) {
    return {
      error: authErrorMessage(error),
      email,
      nextStep: "reset-email-sent",
    };
  }

  redirect("/reset-password");
}

export async function updatePassword(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (isDemoMode) return { error: DEMO_MSG };

  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  if (!password || !confirmPassword) {
    return { error: "Enter and confirm your new password." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error: "Your reset session is invalid or expired. Request a fresh reset code.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: authErrorMessage(error) };

  const email = user.email ?? null;
  const siteUrl = await resolveAuthSiteUrl();
  await supabase.auth.signOut();
  redirect(
    buildLoginUrl(siteUrl, "Password updated. Sign in with your new password.", email)
  );
}

export async function signInWithGoogle(): Promise<AuthState> {
  if (isDemoMode) return { error: DEMO_MSG };
  const ip = await getRequestClientIp();
  const rateLimit = await enforceRateLimit({
    scope: "auth:oauth-google",
    windowSeconds: LOGIN_WINDOW_SECONDS,
    buckets: [{ key: `ip:${rateLimitKeyPart(ip)}`, limit: 12 }],
  });
  if (!rateLimit.allowed) {
    return {
      error: `Too many sign-in attempts were made from this device. Please wait ${formatRetryAfter(rateLimit.retryAfterSeconds)} before trying Google sign-in again.`,
    };
  }
  const siteUrl = await resolveAuthSiteUrl();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${siteUrl}/auth/callback` },
  });
  if (error) return { error: authErrorMessage(error) };
  if (data.url) redirect(data.url);
  return {};
}

export async function signOut(): Promise<void> {
  if (!isDemoMode) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}

export async function deleteAccount(
  _prev: DeleteAccountState,
  formData: FormData
): Promise<DeleteAccountState> {
  if (isDemoMode) return { error: DEMO_MSG };
  if (!isSupabaseAdminConfigured) {
    return { error: ACCOUNT_DELETE_UNAVAILABLE_MSG };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in again before deleting your account." };
  }

  const email = normalizeEmail(user.email);
  const confirmation = normalizeEmail(formData.get("confirmation"));
  if (!email || confirmation !== email) {
    return { error: "Type your full account email to confirm permanent deletion." };
  }

  const ip = await getRequestClientIp();
  const rateLimit = await enforceRateLimit({
    scope: "auth:delete-account",
    windowSeconds: DELETE_ACCOUNT_WINDOW_SECONDS,
    buckets: [
      { key: `ip:${rateLimitKeyPart(ip)}`, limit: 3 },
      { key: `user:${rateLimitKeyPart(user.id)}`, limit: 2 },
    ],
  });
  if (!rateLimit.allowed) {
    return {
      error: `Too many account deletion attempts were made. Please wait ${formatRetryAfter(rateLimit.retryAfterSeconds)} before trying again.`,
    };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return {
      error: "We could not delete your account right now. Please try again in a minute.",
    };
  }

  try {
    await supabase.auth.signOut();
  } catch {
    // The auth record is already removed, so sign-out becomes best-effort.
  }

  const siteUrl = await resolveAuthSiteUrl();
  redirect(
    buildLoginUrl(siteUrl, "Your account and personal data were deleted successfully.", null, {
      accountDeleted: true,
    })
  );
}
