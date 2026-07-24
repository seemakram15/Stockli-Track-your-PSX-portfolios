"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  requestPasswordReset,
  resendSignupConfirmation,
  signIn,
  signUp,
  verifyRecoveryOtp,
  verifySignupOtp,
  type AuthState,
} from "@/lib/actions/auth";
import { ACCOUNT_WARMUP_FLAG } from "@/components/auth/account-warmup";

function Field({
  label,
  htmlFor,
  icon: Icon,
  children,
}: {
  label: string;
  htmlFor: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-[13px] font-medium tracking-tight text-foreground/85">
        {label}
      </Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        {children}
      </div>
    </div>
  );
}

export function AuthForm({
  mode,
  redirectTo,
  demo,
  onModeChange,
  initialState,
}: {
  mode: "login" | "signup" | "forgot-password";
  redirectTo?: string;
  demo?: boolean;
  onModeChange?: (mode: "login" | "signup" | "forgot-password") => void;
  initialState?: AuthState;
}) {
  const action =
    mode === "login" ? signIn : mode === "signup" ? signUp : requestPasswordReset;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    initialState ?? {}
  );
  const [showPassword, setShowPassword] = React.useState(false);

  if (
    (mode === "signup" || mode === "forgot-password") &&
    state.nextStep === "confirm-signup" &&
    state.email
  ) {
    return (
      <OtpVerificationView
        kind="signup"
        email={state.email}
        message={state.message}
        error={state.error}
        demo={demo}
        onModeChange={onModeChange}
      />
    );
  }

  if (mode === "forgot-password" && state.nextStep === "reset-email-sent" && state.email) {
    return (
      <OtpVerificationView
        kind="recovery"
        email={state.email}
        message={state.message}
        error={state.error}
        demo={demo}
        onModeChange={onModeChange}
      />
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

      {mode === "signup" && (
        <Field label="Name" htmlFor="displayName" icon={User}>
          <Input
            id="displayName"
            name="displayName"
            placeholder="e.g. Asad Khan"
            autoComplete="name"
            className="h-11 pl-10"
          />
        </Field>
      )}

      <Field label="Email" htmlFor="email" icon={Mail}>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={state.email ?? initialState?.email ?? ""}
          placeholder="e.g. you@example.com"
          autoComplete="email"
          required
          className="h-11 pl-10"
        />
      </Field>

      {mode !== "forgot-password" && (
        <Field label="Password" htmlFor="password" icon={Lock}>
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            className="h-11 pl-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </Field>
      )}

      {mode === "login" ? (
        <div className="flex justify-end">
          {onModeChange ? (
            <button
              type="button"
              onClick={() => onModeChange("forgot-password")}
              className="text-sm font-medium text-foreground underline-offset-2 hover:underline"
            >
              Forgot password?
            </button>
          ) : (
            <Link href="/forgot-password" className="text-sm font-medium text-foreground hover:underline">
              Forgot password?
            </Link>
          )}
        </div>
      ) : null}

      {state.error && (
        <p className="flex items-start gap-2 rounded-lg bg-loss/10 px-3 py-2 text-sm text-loss">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}
      {state.message && (
        <p className="flex items-start gap-2 rounded-lg bg-gain/10 px-3 py-2 text-sm text-gain">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        onClick={() => {
          // Arm the post-sign-in "Setting your account" warm-up; it runs once on
          // the dashboard and pre-caches heavy pages to the device.
          if (mode === "login") {
            try {
              window.sessionStorage.setItem(ACCOUNT_WARMUP_FLAG, "1");
            } catch {
              // sessionStorage may be unavailable; warm-up is best-effort.
            }
          }
        }}
        className="h-11 w-full gap-2 bg-gradient-to-r from-emerald-500 to-emerald-400 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-500 hover:to-emerald-300 hover:shadow-emerald-500/35"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        {mode === "login"
          ? "Sign in"
          : mode === "signup"
            ? "Create account"
            : "Send reset code"}
      </Button>

      {demo && (
        <p className="rounded-lg border border-dashed border-border px-3 py-2 text-center text-xs text-muted-foreground">
          You can{" "}
          <Link href="/dashboard" className="font-medium text-primary underline-offset-2 hover:underline">
            browse the dashboard
          </Link>{" "}
          as a guest. Sign-in may be temporarily unavailable.
        </p>
      )}

      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            New here?{" "}
            {onModeChange ? (
              <button
                type="button"
                onClick={() => onModeChange("signup")}
                className="font-medium text-foreground underline-offset-2 hover:underline"
              >
                Create an account
              </button>
            ) : (
              <Link href="/signup" className="font-medium text-foreground hover:underline">
                Create an account
              </Link>
            )}
          </>
        ) : mode === "forgot-password" ? (
          <>
            Remembered your password?{" "}
            {onModeChange ? (
              <button
                type="button"
                onClick={() => onModeChange("login")}
                className="font-medium text-foreground underline-offset-2 hover:underline"
              >
                Sign in
              </button>
            ) : (
              <Link href="/login" className="font-medium text-foreground hover:underline">
                Sign in
              </Link>
            )}
          </>
        ) : (
          <>
            Already have an account?{" "}
            {onModeChange ? (
              <button
                type="button"
                onClick={() => onModeChange("login")}
                className="font-medium text-foreground underline-offset-2 hover:underline"
              >
                Sign in
              </button>
            ) : (
              <Link href="/login" className="font-medium text-foreground hover:underline">
                Sign in
              </Link>
            )}
          </>
        )}
      </p>
    </form>
  );
}

function OtpVerificationView({
  kind,
  email,
  message,
  error,
  demo,
  onModeChange,
}: {
  kind: "signup" | "recovery";
  email: string;
  message?: string;
  error?: string;
  demo?: boolean;
  onModeChange?: (mode: "login" | "signup" | "forgot-password") => void;
}) {
  const verifyAction = kind === "signup" ? verifySignupOtp : verifyRecoveryOtp;
  const resendAction = kind === "signup" ? resendSignupConfirmation : requestPasswordReset;
  const [verifyState, verifyFormAction, verifyPending] = useActionState<AuthState, FormData>(
    verifyAction,
    {}
  );
  const [resendState, resendFormAction, resendPending] = useActionState<AuthState, FormData>(
    resendAction,
    {}
  );

  const note = resendState.message ?? verifyState.message ?? message;
  const issue = verifyState.error ?? resendState.error ?? error;
  const isSignup = kind === "signup";

  return (
    <div className="space-y-4">
      <div
        className={
          isSignup
            ? "rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm"
            : "rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm"
        }
      >
        <div className="flex items-start gap-3">
          <span
            className={
              isSignup
                ? "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"
                : "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
            }
          >
            {isSignup ? <ShieldCheck className="size-4" /> : <KeyRound className="size-4" />}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-foreground">
              {isSignup ? "Enter your confirmation code" : "Enter your reset code"}
            </p>
            <p className="mt-1 text-muted-foreground">
              We emailed a one-time code to{" "}
              <span className="font-medium text-foreground">{email}</span>. It expires in 10
              minutes.
            </p>
            {note ? <p className="mt-2 text-muted-foreground">{note}</p> : null}
          </div>
        </div>
      </div>

      {issue ? (
        <p className="flex items-start gap-2 rounded-lg bg-loss/10 px-3 py-2 text-sm text-loss">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {issue}
        </p>
      ) : null}

      <form action={verifyFormAction} className="space-y-3">
        <input type="hidden" name="email" value={email} />
        <div className="space-y-2">
          <Label htmlFor="otp" className="text-[13px] font-medium tracking-tight text-foreground/85">
            {isSignup ? "Confirmation code" : "Reset code"}
          </Label>
          <Input
            id="otp"
            name="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={8}
            placeholder="12345678"
            required
            className="h-12 text-center font-mono text-xl tracking-[0.35em]"
          />
        </div>
        <Button
          type="submit"
          disabled={verifyPending || demo}
          className="h-11 w-full gap-2 bg-gradient-to-r from-emerald-500 to-emerald-400 text-base font-semibold text-white shadow-lg shadow-emerald-500/25"
        >
          {verifyPending ? <Loader2 className="size-4 animate-spin" /> : null}
          {isSignup ? "Verify email" : "Continue to new password"}
        </Button>
      </form>

      <form action={resendFormAction}>
        <input type="hidden" name="email" value={email} />
        <Button
          type="submit"
          variant="outline"
          className="h-11 w-full gap-2"
          disabled={resendPending || demo}
        >
          {resendPending ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
          Resend code
        </Button>
      </form>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          type="button"
          variant="ghost"
          className="h-11"
          onClick={() => onModeChange?.(isSignup ? "signup" : "forgot-password")}
        >
          Use another email
        </Button>
        <Button type="button" className="h-11" onClick={() => onModeChange?.("login")}>
          Back to sign in
        </Button>
      </div>
    </div>
  );
}
