import type { Metadata } from "next";
import { KeyRound } from "lucide-react";
import { AuthScreen } from "@/components/auth/auth-screen";
import { AuthCardShell } from "@/components/auth/auth-card-shell";
import { isDemoMode } from "@/lib/config";

export const metadata: Metadata = { title: "Reset your password" };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{
    authError?: string;
    authMessage?: string;
    authEmail?: string;
  }>;
}) {
  const { authError, authMessage, authEmail } = await searchParams;

  return (
    <AuthCardShell
      accent="amber"
      icon={<KeyRound />}
      title="Reset your password"
      description="We'll email a secure password reset link to your inbox."
    >
      <AuthScreen
        mode="forgot-password"
        demo={isDemoMode}
        initialState={{ error: authError, message: authMessage, email: authEmail }}
      />
    </AuthCardShell>
  );
}
