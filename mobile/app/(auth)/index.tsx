import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  Globe2, BarChart3, Wallet, Bell, TrendingUp, TrendingDown, ArrowRight,
} from "lucide-react-native";
import { useColors } from "@/lib/theme";

const FEATURES = [
  { icon: Globe2,    label: "9+ Markets",        sub: "PSX, US, funds, crypto",     color: "#34d399" },
  { icon: TrendingUp, label: "Live Prices",       sub: "30-second refresh",           color: "#38bdf8" },
  { icon: Wallet,    label: "Portfolio P/L",      sub: "Real-time gains & losses",    color: "#a78bfa" },
  { icon: BarChart3, label: "Fundamentals",       sub: "P/E, ROE, earnings & more",  color: "#fbbf24" },
  { icon: Bell,      label: "Price Alerts",       sub: "Get notified instantly",       color: "#fb923c" },
  { icon: TrendingDown, label: "Watchlists",      sub: "Track your favourites",        color: "#f472b6" },
];

const MOVERS = [
  { symbol: "ENGRO",  change: +4.32 },
  { symbol: "LUCK",   change: -2.18 },
  { symbol: "HBL",    change: +3.67 },
  { symbol: "PSO",    change: -1.44 },
  { symbol: "OGDC",   change: +2.91 },
];

const { width } = Dimensions.get("window");

export default function LandingScreen() {
  const c = useColors();

  return (
    <View className="flex-1 bg-[#04100d]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Hero ────────────────────────────────────────────── */}
        <SafeAreaView edges={["top"]}>
          <View className="px-6 pt-6 pb-10">
            {/* Wordmark */}
            <View className="flex-row items-center gap-2 mb-12">
              <View className="size-9 items-center justify-center rounded-xl bg-[#34d399]/20">
                <TrendingUp size={18} color="#34d399" />
              </View>
              <Text style={{ fontWeight: "800", fontSize: 22, color: "#eef3f2", letterSpacing: -0.5 }}>
                Stockli
              </Text>
            </View>

            {/* Headline */}
            <View className="mb-6">
              <Text style={{ fontSize: 40, fontWeight: "700", color: "#eef3f2", lineHeight: 46, letterSpacing: -1 }}>
                Your entire{"\n"}market,{"\n"}
                <Text style={{ color: "#34d399" }}>on Stockli.</Text>
              </Text>
              <Text style={{ fontSize: 16, color: "#7a9098", lineHeight: 24, marginTop: 12 }}>
                Track PSX stocks, mutual funds, ETFs, crypto and more — with live P/L and alerts.
              </Text>
            </View>

            {/* CTA buttons */}
            <View className="gap-3 mb-10">
              <Pressable
                onPress={() => router.push("/(auth)/signup")}
                className="py-4 rounded-2xl items-center active:opacity-80"
                style={{ backgroundColor: "#34d399" }}
              >
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#04100d" }}>
                  Start tracking free
                </Text>
              </Pressable>
              <Pressable
                onPress={() => router.push("/(auth)/login")}
                className="py-4 rounded-2xl items-center border active:opacity-70"
                style={{ borderColor: "rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.06)" }}
              >
                <Text style={{ fontSize: 16, fontWeight: "600", color: "#eef3f2" }}>
                  Sign in
                </Text>
              </Pressable>
            </View>

            {/* Live ticker strip */}
            <View
              className="flex-row gap-2 overflow-hidden mb-2"
              style={{ marginHorizontal: -4 }}
            >
              {MOVERS.map((m) => (
                <View
                  key={m.symbol}
                  className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl"
                  style={{
                    backgroundColor: m.change > 0
                      ? "rgba(74,222,128,0.1)"
                      : "rgba(248,113,113,0.1)",
                  }}
                >
                  {m.change > 0
                    ? <TrendingUp size={12} color="#4ade80" />
                    : <TrendingDown size={12} color="#f87171" />}
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#eef3f2" }}>{m.symbol}</Text>
                  <Text style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: m.change > 0 ? "#4ade80" : "#f87171",
                  }}>
                    {m.change > 0 ? "+" : ""}{m.change.toFixed(2)}%
                  </Text>
                </View>
              ))}
            </View>
            <Text style={{ fontSize: 11, color: "#7a9098", marginTop: 4 }}>
              Sample data — live prices after sign-in
            </Text>
          </View>
        </SafeAreaView>

        {/* ── Features grid ───────────────────────────────────── */}
        <View style={{ backgroundColor: "#0d1e19", paddingVertical: 28, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#34d399", letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>
            Everything you need
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <View
                  key={f.label}
                  style={{
                    width: (width - 52) / 2,
                    backgroundColor: "rgba(255,255,255,0.04)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.07)",
                    borderRadius: 16,
                    padding: 16,
                  }}
                >
                  <View
                    style={{
                      width: 36, height: 36,
                      borderRadius: 10,
                      alignItems: "center", justifyContent: "center",
                      backgroundColor: f.color + "20",
                      marginBottom: 10,
                    }}
                  >
                    <Icon size={16} color={f.color} />
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#eef3f2", marginBottom: 2 }}>
                    {f.label}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#7a9098", lineHeight: 17 }}>
                    {f.sub}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Markets covered ─────────────────────────────────── */}
        <View style={{ paddingVertical: 28, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#eef3f2", marginBottom: 4, letterSpacing: -0.3 }}>
            All markets in one app
          </Text>
          <Text style={{ fontSize: 14, color: "#7a9098", marginBottom: 20, lineHeight: 21 }}>
            Switch between PSX, US indices, mutual funds, ETFs and crypto without leaving.
          </Text>
          {[
            { label: "Pakistan Stock Exchange", tag: "PSX", color: "#34d399" },
            { label: "MUFAP Mutual Funds",       tag: "FUNDS",  color: "#38bdf8" },
            { label: "US & World Indices",        tag: "GLOBAL", color: "#a78bfa" },
            { label: "Commodities & Crypto",      tag: "CRYPTO", color: "#fbbf24" },
          ].map((m) => (
            <View
              key={m.label}
              className="flex-row items-center justify-between py-3.5 border-b"
              style={{ borderColor: "rgba(255,255,255,0.07)" }}
            >
              <Text style={{ fontSize: 15, fontWeight: "600", color: "#eef3f2" }}>{m.label}</Text>
              <View style={{ backgroundColor: m.color + "20", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: m.color }}>{m.tag}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Final CTA ───────────────────────────────────────── */}
        <View
          style={{
            margin: 20,
            borderRadius: 24,
            overflow: "hidden",
            backgroundColor: "#0d2b22",
            borderWidth: 1,
            borderColor: "rgba(52,211,153,0.2)",
            padding: 24,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#eef3f2", lineHeight: 30, marginBottom: 8 }}>
            The smartest way to track markets in Pakistan.
          </Text>
          <Text style={{ fontSize: 14, color: "#7a9098", lineHeight: 21, marginBottom: 20 }}>
            Free forever. No credit card required.
          </Text>
          <Pressable
            onPress={() => router.push("/(auth)/signup")}
            className="flex-row items-center justify-center gap-2 py-4 rounded-2xl active:opacity-80"
            style={{ backgroundColor: "#34d399" }}
          >
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#04100d" }}>Get started free</Text>
            <ArrowRight size={16} color="#04100d" />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
