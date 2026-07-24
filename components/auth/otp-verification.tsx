"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  requestPasswordReset,
  resendSignupConfirmation,
  type AuthState,
} from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const OTP_LENGTH = 6;

type OtpKind = "signup" | "recovery";

export function OtpVerificationPanel({
  kind,
  email,
  error,
  demo,
  onModeChange,
}: {
  kind: OtpKind;
  email: string;
  message?: string;
  error?: string;
  demo?: boolean;
  onModeChange?: (mode: "login" | "signup" | "forgot-password") => void;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);
  const [digits, setDigits] = React.useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const [focusedIndex, setFocusedIndex] = React.useState(0);
  const [phase, setPhase] = React.useState<"enter" | "verifying" | "success">("enter");
  const [issue, setIssue] = React.useState<string | undefined>(error);
  const [statusNote, setStatusNote] = React.useState<string | undefined>();
  const [resendPending, setResendPending] = React.useState(false);
  const submittingRef = React.useRef(false);

  const code = digits.join("");
  const isSignup = kind === "signup";

  React.useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  React.useEffect(() => {
    if (code.length !== OTP_LENGTH || submittingRef.current || phase !== "enter" || demo) return;
    void verifyCode(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- auto-verify when complete
  }, [code, phase, demo]);

  async function verifyCode(token: string) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setPhase("verifying");
    setIssue(undefined);
    setStatusNote(undefined);

    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: isSignup ? "signup" : "recovery",
      });

      if (verifyError) {
        setIssue(
          /expired|invalid|otp/i.test(verifyError.message)
            ? "That code is invalid or expired. Request a new one and try again."
            : "We couldn’t verify that code. Please try again."
        );
        setDigits(Array(OTP_LENGTH).fill(""));
        setFocusedIndex(0);
        setPhase("enter");
        submittingRef.current = false;
        requestAnimationFrame(() => inputsRef.current[0]?.focus());
        return;
      }

      setPhase("success");
      await wait(reduceMotion ? 400 : 1400);

      if (isSignup) {
        await supabase.auth.signOut();
        const login = new URL("/login", window.location.origin);
        login.searchParams.set(
          "authMessage",
          "Email verified. Sign in to open your Stockli portfolio."
        );
        login.searchParams.set("authEmail", email);
        router.replace(login.pathname + login.search);
        router.refresh();
        return;
      }

      router.replace("/reset-password");
      router.refresh();
    } catch {
      setIssue("We couldn’t verify that code right now. Please try again.");
      setPhase("enter");
      submittingRef.current = false;
    }
  }

  function updateDigit(index: number, raw: string) {
    const value = raw.replace(/\D/g, "");
    if (!value) {
      setDigits((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }

    if (value.length > 1) {
      const chars = value.slice(0, OTP_LENGTH).split("");
      setDigits((prev) => {
        const next = [...prev];
        for (let i = 0; i < OTP_LENGTH; i += 1) next[i] = chars[i] ?? "";
        return next;
      });
      const focusAt = Math.min(chars.length, OTP_LENGTH - 1);
      setFocusedIndex(focusAt);
      inputsRef.current[focusAt]?.focus();
      return;
    }

    setDigits((prev) => {
      const next = [...prev];
      next[index] = value.slice(-1);
      return next;
    });

    if (index < OTP_LENGTH - 1) {
      setFocusedIndex(index + 1);
      inputsRef.current[index + 1]?.focus();
    }
  }

  function onKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      setDigits((prev) => {
        const next = [...prev];
        next[index - 1] = "";
        return next;
      });
      setFocusedIndex(index - 1);
      inputsRef.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputsRef.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  }

  async function handleResend() {
    if (demo || resendPending || phase === "success") return;
    setResendPending(true);
    setIssue(undefined);
    try {
      const formData = new FormData();
      formData.set("email", email);
      const result: AuthState = isSignup
        ? await resendSignupConfirmation({}, formData)
        : await requestPasswordReset({}, formData);
      if (result.error) setIssue(result.error);
      else {
        setStatusNote("New code sent. Check your inbox — it expires in 10 minutes.");
        setDigits(Array(OTP_LENGTH).fill(""));
        setFocusedIndex(0);
        submittingRef.current = false;
        setPhase("enter");
        inputsRef.current[0]?.focus();
      }
    } finally {
      setResendPending(false);
    }
  }

  return (
    <div className="flex h-full min-h-[28rem] flex-col overflow-hidden rounded-[1.35rem] bg-card text-card-foreground ring-1 ring-border">
      <div className="relative flex flex-1 flex-col px-6 pb-8 pt-7 sm:px-8 sm:pb-9 sm:pt-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              phase === "success"
                ? "radial-gradient(50% 45% at 50% 48%, color-mix(in oklab, var(--primary) 22%, transparent), transparent 70%)"
                : "radial-gradient(55% 40% at 50% 0%, color-mix(in oklab, var(--primary) 16%, transparent), transparent 65%)",
          }}
        />

        <div className="relative mx-auto mb-6 h-1 w-10 rounded-full bg-primary/25" aria-hidden />

        <AnimatePresence mode="wait">
          {phase === "success" ? (
            <motion.div
              key="success"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col items-center text-center"
            >
              <h2 className="text-[1.65rem] font-semibold tracking-tight text-foreground sm:text-[1.85rem]">
                Verified successfully
              </h2>
              <p className="mt-2 max-w-sm text-[15px] leading-6 text-muted-foreground">
                {isSignup
                  ? "Your email is confirmed. Taking you to sign in…"
                  : "Code confirmed. Choose a new password next."}
              </p>

              <motion.div
                initial={reduceMotion ? false : { scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.12, type: "spring", stiffness: 260, damping: 18 }}
                className="relative mt-12 mb-14"
              >
                <div className="absolute inset-0 rounded-[1.35rem] bg-primary/20 blur-2xl" />
                <div className="relative flex size-[5.25rem] items-center justify-center rounded-[1.35rem] bg-card shadow-[0_0_0_1.5px_var(--primary),0_0_28px_color-mix(in_oklab,var(--primary)_35%,transparent)]">
                  <Check className="size-10 text-primary" strokeWidth={2.75} />
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="enter"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="relative text-center"
            >
              <h2 className="text-[1.65rem] font-semibold tracking-tight text-foreground sm:text-[1.85rem]">
                Let&apos;s verify your email
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-[15px] leading-6 text-muted-foreground">
                Enter the 6-digit code sent to{" "}
                <span className="font-medium text-foreground">{email}</span>. It expires in 10
                minutes and verifies automatically.
              </p>
              {statusNote ? (
                <p className="mt-3 text-sm font-medium text-primary">{statusNote}</p>
              ) : null}

              <div className="mt-10 flex justify-center gap-2 sm:gap-2.5">
                {digits.map((digit, index) => {
                  const active = focusedIndex === index && phase === "enter";
                  const filled = Boolean(digit);
                  return (
                    <OtpBox
                      key={index}
                      value={digit}
                      active={active}
                      filled={filled}
                      disabled={phase === "verifying" || demo}
                      reduceMotion={Boolean(reduceMotion)}
                      inputRef={(el) => {
                        inputsRef.current[index] = el;
                      }}
                      onFocus={() => setFocusedIndex(index)}
                      onChange={(value) => updateDigit(index, value)}
                      onKeyDown={(event) => onKeyDown(index, event)}
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                    />
                  );
                })}
              </div>

              {phase === "verifying" ? (
                <p className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  Verifying code…
                </p>
              ) : null}

              {issue ? (
                <p className="mt-5 rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {issue}
                </p>
              ) : null}

              <p className="mt-12 text-[15px] text-muted-foreground">
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  onClick={() => void handleResend()}
                  disabled={resendPending || demo || phase === "verifying"}
                  className="font-semibold text-primary underline-offset-2 transition hover:underline disabled:opacity-50"
                >
                  {resendPending ? "Sending…" : "Resend"}
                </button>
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <button
                  type="button"
                  className="hover:text-foreground"
                  onClick={() => onModeChange?.(isSignup ? "signup" : "forgot-password")}
                >
                  Use another email
                </button>
                <span aria-hidden>·</span>
                <button
                  type="button"
                  className="hover:text-foreground"
                  onClick={() => onModeChange?.("login")}
                >
                  Back to sign in
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function OtpBox({
  value,
  active,
  filled,
  disabled,
  reduceMotion,
  inputRef,
  onFocus,
  onChange,
  onKeyDown,
  autoComplete,
}: {
  value: string;
  active: boolean;
  filled: boolean;
  disabled?: boolean;
  reduceMotion: boolean;
  inputRef: (el: HTMLInputElement | null) => void;
  onFocus: () => void;
  onChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  autoComplete?: string;
}) {
  const glow = active || filled;

  return (
    <div className="relative size-[3.15rem] sm:size-[3.4rem]">
      <div
        className={cn(
          "absolute inset-0 overflow-hidden rounded-[0.95rem]",
          glow ? "opacity-100" : "opacity-60"
        )}
      >
        {glow && !reduceMotion ? (
          <motion.div
            aria-hidden
            className="absolute inset-[-55%]"
            style={{
              background:
                "conic-gradient(from 0deg, var(--primary), color-mix(in oklab, var(--primary) 55%, white), var(--chart-2), var(--primary))",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: glow
                ? "linear-gradient(135deg, var(--primary), color-mix(in oklab, var(--primary) 70%, var(--chart-2)))"
                : "linear-gradient(180deg, color-mix(in oklab, var(--border) 80%, var(--muted)), var(--border))",
            }}
          />
        )}
      </div>
      <div
        className={cn(
          "absolute inset-[1.6px] flex items-center justify-center rounded-[0.82rem] bg-background",
          active && "ring-1 ring-primary/20"
        )}
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={OTP_LENGTH}
          value={value}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-label="One-time code digit"
          onFocus={onFocus}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          className="size-full bg-transparent text-center text-[1.45rem] font-semibold text-foreground caret-primary outline-none"
        />
        {value ? (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[0.82rem]"
            initial={reduceMotion ? false : { opacity: 0.55, scale: 0.86 }}
            animate={{ opacity: 0, scale: 1.12 }}
            transition={{ duration: 0.35 }}
            style={{ boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--primary) 45%, transparent)" }}
            key={value}
          />
        ) : null}
      </div>
    </div>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
