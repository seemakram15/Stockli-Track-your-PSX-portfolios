import type { Metadata } from "next";
import { UserPlus } from "lucide-react";
import { AuthScreen } from "@/components/auth/auth-screen";
import { AuthCardShell } from "@/components/auth/auth-card-shell";
import { isDemoMode } from "@/lib/config";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{
    redirectTo?: string;
    authError?: string;
    authMessage?: string;
    authEmail?: string;
  }>;
}) {
  const { redirectTo, authError, authMessage, authEmail } = await searchParams;

  return (
    <AuthCardShell
      accent="sky"
      icon={<UserPlus />}
      title={`Create your ${APP_NAME} account`}
      description="Start tracking portfolios, P/L calendars, alerts and market movement."
    >
      <AuthScreen
        mode="signup"
        redirectTo={redirectTo}
        demo={isDemoMode}
        initialState={{ error: authError, message: authMessage, email: authEmail }}
      />
    </AuthCardShell>
  );
}
