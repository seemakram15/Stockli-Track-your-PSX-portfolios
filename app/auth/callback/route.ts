import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { safeRedirectPath } from "@/lib/security/validation";
import { resolveSiteUrlFromRequestUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * OAuth / legacy email-link callback.
 *
 * Confirm signup and password reset now use email OTP codes entered in the app.
 * This route still supports Google OAuth and any older token_hash links.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteUrl = resolveSiteUrlFromRequestUrl(request.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"), "/dashboard");
  const tokenHash = searchParams.get("token_hash");
  const type = normalizeOtpType(searchParams.get("type"));
  const supabase = await createClient();

  // Prefer token_hash (email templates) — works across browsers/devices.
  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (!error) {
      return redirectAfterSuccess(supabase, siteUrl, type, next, data.user?.email);
    }
    console.error("[auth/callback] verifyOtp failed", { type, message: error.message });
    return redirectToLoginWithError(siteUrl, callbackErrorMessage(type));
  }

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return redirectAfterSuccess(
        supabase,
        siteUrl,
        type,
        next,
        data.user?.email ?? data.session?.user?.email
      );
    }
    console.error("[auth/callback] exchangeCodeForSession failed", {
      type,
      message: error.message,
    });
    return redirectToLoginWithError(
      siteUrl,
      "That email link is invalid or expired. Request a fresh confirmation or reset email and open it once."
    );
  }

  return redirectToLoginWithError(
    siteUrl,
    "That auth link is invalid or expired. Please request a fresh one."
  );
}

function redirectToLoginWithError(siteUrl: string, message: string) {
  const loginUrl = new URL("/login", siteUrl);
  loginUrl.searchParams.set("authError", message);
  return NextResponse.redirect(loginUrl);
}

function redirectToLoginWithMessage(siteUrl: string, message: string, email?: string | null) {
  const loginUrl = new URL("/login", siteUrl);
  loginUrl.searchParams.set("authMessage", message);
  if (email) loginUrl.searchParams.set("authEmail", email);
  return NextResponse.redirect(loginUrl);
}

async function redirectAfterSuccess(
  supabase: Awaited<ReturnType<typeof createClient>>,
  siteUrl: string,
  type: EmailOtpType | null,
  next: string,
  email?: string | null
) {
  // Signup confirmation (and legacy "email" OTP) — confirm then require password sign-in.
  if (type === "signup" || type === "email") {
    await supabase.auth.signOut();
    return redirectToLoginWithMessage(
      siteUrl,
      "Email verified successfully. Sign in to continue to your Stockli portfolio.",
      email
    );
  }
  return NextResponse.redirect(new URL(next, siteUrl));
}

function normalizeOtpType(value: string | null): EmailOtpType | null {
  if (
    value === "signup" ||
    value === "recovery" ||
    value === "invite" ||
    value === "magiclink" ||
    value === "email_change" ||
    value === "email"
  ) {
    return value;
  }
  return null;
}

function callbackErrorMessage(type: EmailOtpType) {
  if (type === "recovery") {
    return "That password reset link is invalid or expired. Request a fresh reset email.";
  }
  return "That confirmation link is invalid or expired. Request a fresh confirmation email and try again.";
}
