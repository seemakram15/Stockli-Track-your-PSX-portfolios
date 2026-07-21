import * as React from "react";
import { View, Text, KeyboardAvoidingView, Platform, Pressable, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft, TrendingUp } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useColors } from "@/lib/theme";

export default function LoginScreen() {
  const c = useColors();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) Alert.alert("Sign in failed", error.message);
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-3">
          <Pressable onPress={() => router.back()} hitSlop={10} className="p-1 mr-2">
            <ChevronLeft size={22} color={c.fg} />
          </Pressable>
          <View className="flex-row items-center gap-2">
            <View className="size-7 items-center justify-center rounded-lg" style={{ backgroundColor: c.primary + "25" }}>
              <TrendingUp size={14} color={c.primary} />
            </View>
            <Text style={{ fontSize: 17, fontWeight: "700", color: c.fg }}>Stockli</Text>
          </View>
        </View>

        <View className="flex-1 px-6 pt-6 gap-8">
          {/* Title */}
          <View>
            <Text style={{ fontSize: 30, fontWeight: "700", color: c.fg, letterSpacing: -0.5, marginBottom: 6 }}>
              Welcome back
            </Text>
            <Text style={{ fontSize: 15, color: c.muted, lineHeight: 22 }}>
              Sign in to your Stockli account to continue.
            </Text>
          </View>

          {/* Fields */}
          <View className="gap-4">
            <View className="gap-1.5">
              <Text style={{ fontSize: 11, fontWeight: "700", color: c.muted, textTransform: "uppercase", letterSpacing: 1 }}>
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={c.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={{
                  height: 52,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: c.border,
                  backgroundColor: c.card,
                  paddingHorizontal: 16,
                  fontSize: 15,
                  color: c.fg,
                }}
              />
            </View>

            <View className="gap-1.5">
              <Text style={{ fontSize: 11, fontWeight: "700", color: c.muted, textTransform: "uppercase", letterSpacing: 1 }}>
                Password
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={c.muted}
                secureTextEntry
                autoComplete="password"
                style={{
                  height: 52,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: c.border,
                  backgroundColor: c.card,
                  paddingHorizontal: 16,
                  fontSize: 15,
                  color: c.fg,
                }}
              />
            </View>

            <Pressable onPress={() => router.push("/(auth)/forgot-password")} className="self-end">
              <Text style={{ fontSize: 13, color: c.primary, fontWeight: "600" }}>Forgot password?</Text>
            </Pressable>
          </View>

          {/* Sign in button */}
          <Pressable
            onPress={handleLogin}
            disabled={loading || !email.trim() || !password}
            className="py-4 rounded-2xl items-center"
            style={{
              backgroundColor: c.primary,
              opacity: loading || !email.trim() || !password ? 0.55 : 1,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#04100d" }}>
              {loading ? "Signing in…" : "Sign in"}
            </Text>
          </Pressable>

          {/* Sign up link */}
          <View className="flex-row items-center justify-center gap-1">
            <Text style={{ fontSize: 14, color: c.muted }}>Don't have an account?</Text>
            <Pressable onPress={() => router.push("/(auth)/signup")}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: c.primary }}>Sign up</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
