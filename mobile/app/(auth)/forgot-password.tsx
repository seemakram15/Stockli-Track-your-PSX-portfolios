import * as React from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Step = "request" | "otp" | "password";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [step, setStep] = React.useState<Step>("request");
  const [loading, setLoading] = React.useState(false);

  async function handleSendCode() {
    const normalized = email.trim().toLowerCase();
    if (!normalized) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(normalized);
    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    setStep("otp");
    Alert.alert("Code sent", "Enter the 10-minute reset code from your email.");
  }

  async function handleVerifyCode() {
    const normalized = email.trim().toLowerCase();
    const token = otp.replace(/\D/g, "");
    if (!normalized || token.length < 6) {
      Alert.alert("Missing code", "Enter the full reset code from your email.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: normalized,
      token,
      type: "recovery",
    });
    setLoading(false);
    if (error) {
      Alert.alert("Invalid code", error.message);
      return;
    }
    setStep("password");
  }

  async function handleUpdatePassword() {
    if (password.length < 8) {
      Alert.alert("Weak password", "Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (!error) {
      await supabase.auth.signOut();
    }
    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    Alert.alert("Password updated", "Sign in with your new password.");
    router.replace("/(auth)/login");
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center px-6"
      >
        <View className="mb-10">
          <Pressable onPress={() => router.back()} className="mb-6">
            <Text className="text-[15px] text-accent">← Back</Text>
          </Pressable>
          <Text className="text-[28px] font-extrabold tracking-tight text-text">
            {step === "request"
              ? "Reset password"
              : step === "otp"
                ? "Enter reset code"
                : "Choose new password"}
          </Text>
          <Text className="mt-1 text-[15px] text-muted">
            {step === "request"
              ? "Enter your email to receive a 10-minute reset code"
              : step === "otp"
                ? `We sent a code to ${email.trim().toLowerCase()}`
                : "Create a fresh password for your Stockli account"}
          </Text>
        </View>

        <View className="gap-4">
          {step === "request" ? (
            <>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Button label="Send reset code" loading={loading} onPress={handleSendCode} className="mt-2" />
            </>
          ) : null}

          {step === "otp" ? (
            <>
              <Text className="text-[12px] font-bold uppercase tracking-wide text-muted">Reset code</Text>
              <TextInput
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={8}
                placeholder="12345678"
                placeholderTextColor="#7a9098"
                autoComplete="one-time-code"
                style={{
                  height: 56,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,0.12)",
                  paddingHorizontal: 16,
                  fontSize: 22,
                  letterSpacing: 8,
                  textAlign: "center",
                  fontFamily: Platform.select({
                    ios: "Menlo",
                    android: "monospace",
                    default: "monospace",
                  }),
                  color: "#0b171a",
                  backgroundColor: "#fff",
                }}
              />
              <Button label="Continue" loading={loading} onPress={handleVerifyCode} className="mt-2" />
              <Button label="Resend code" loading={loading} onPress={handleSendCode} variant="secondary" />
            </>
          ) : null}

          {step === "password" ? (
            <>
              <Input
                label="New password"
                value={password}
                onChangeText={setPassword}
                placeholder="At least 8 characters"
                secureTextEntry
              />
              <Input
                label="Confirm password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repeat password"
                secureTextEntry
              />
              <Button label="Update password" loading={loading} onPress={handleUpdatePassword} className="mt-2" />
            </>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
