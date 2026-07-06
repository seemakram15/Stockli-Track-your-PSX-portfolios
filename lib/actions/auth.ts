"use server";

import { redirect } from "next/navigation";
import { isDemoMode, isSupabaseAdminConfigured } from "@/lib/config";
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

const DEMO_MSG =
  "Auth is disabled in demo mode. Add your Supabase keys to .env.local to enable sign-in.";

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
    return "We could not send the authentication email right now. Please try again in a minute. If it keeps happening, our email delivery settings need attention.";
  }
  if (status && status >= 500) {
    return "We could not complete that auth request right now. Please try again in a minute.";
  }
  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Too many confirmation emails were requested. Please wait a few minutes before trying again, or sign in if your account is already confirmed.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Please confirm your email first. Check your inbox and click the confirmation link before signing in.";
  }
  if (normalized.includes("user already registered")) {
    return "This email is already registered. Try signing in or reset your password if you forgot it.";
  }
  return message;
}

async function resolveAuthSiteUrl() {
  return resolveRequestSiteUrl();
}

function buildLoginUrl(siteUrl: string, message: string, email?: string | null) {
  const loginUrl = new URL("/login", siteUrl);
  loginUrl.searchParams.set("authMessage", message);
  if (email) loginUrl.searchParams.set("authEmail", email);
  return loginUrl.toString();
}

export async function signIn(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (isDemoMode) return { error: DEMO_MSG };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: authErrorMessage(error) };

  redirect(safeRedirectPath(formData.get("redirectTo")));
}

export async function signUp(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (isDemoMode) return { error: DEMO_MSG };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8)
    return { error: "Password must be at least 8 characters." };

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
    message:
      "We emailed your confirmation link. Open it to activate your account and continue securely.",
    nextStep: "confirm-signup",
  };
}

export async function resendSignupConfirmation(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (isDemoMode) return { error: DEMO_MSG };

  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Email is required.", nextStep: "confirm-signup" };

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
    message: "A fresh confirmation email is on the way.",
    nextStep: "confirm-signup",
  };
}

export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (isDemoMode) return { error: DEMO_MSG };

  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Email is required." };

  const normalizedEmail = email.toLowerCase();
  const genericResetMessage =
    "If this email belongs to a Stockli account, we just sent the next step. Please check your inbox, spam, junk, or promotions within 1 to 2 minutes.";
  const siteUrl = await resolveAuthSiteUrl();
  if (isSupabaseAdminConfigured) {
    const admin = createAdminClient();
    const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (!usersError) {
      const matchingUser = usersData.users.find(
        (user) => user.email?.toLowerCase() === normalizedEmail
      );

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
          message: genericResetMessage,
          nextStep: "reset-email-sent",
        };
      }
    }
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
      error: "This reset link is invalid or expired. Request a fresh password reset email.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: authErrorMessage(error) };

  const email = user.email ?? null;
  const siteUrl = await resolveAuthSiteUrl();
  await supabase.auth.signOut();
  redirect(
    buildLoginUrl(siteUrl, "Password updated successfully. Sign in with your new password.", email)
  );
}

export async function signInWithGoogle(): Promise<AuthState> {
  if (isDemoMode) return { error: DEMO_MSG };
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
