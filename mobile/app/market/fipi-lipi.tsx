import { View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import useSWR from "swr";
import { colors } from "@/lib/theme";
import { Card } from "@/components/ui/ThemedView";
import { ThemedText } from "@/components/ui/ThemedText";
import { api } from "@/lib/api";
import { formatCompact, plColor } from "@/lib/format";

function NetRow({ label, net }: { label: string; net: number }) {
  const color = plColor(net);
  return (
    <View className="flex-row justify-between py-2 border-b border-border">
      <ThemedText variant="caption" className="text-muted flex-1">{label}</ThemedText>
      <ThemedText variant="caption" style={{ color }}>
        {net >= 0 ? "+" : ""}{formatCompact(net)}
      </ThemedText>
    </View>
  );
}

export default function FipiLipiScreen() {
  const { data, isLoading } = useSWR("fipi-lipi", api.market.fipiLipi, {
    revalidateOnFocus: false,
  });

  const fipi = (data as { data?: { fipi?: { net: number; sector: string }[] } } | undefined)?.data?.fipi ?? [];
  const lipi = (data as { data?: { lipi?: { net: number; sector: string }[] } } | undefined)?.data?.lipi ?? [];

  return (
    <SafeAreaView className="flex-1 bg-[#0f0f13]" edges={["top"]}>
      <View className="flex-row items-center gap-3 px-4 pt-2 pb-4">
        <Pressable onPress={() => router.back()} className="size-9 items-center justify-center">
          <ArrowLeft size={20} color={colors.text} />
        </Pressable>
        <ThemedText variant="title">FIPI / LIPI</ThemedText>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4" contentContainerClassName="pb-10 gap-4" showsVerticalScrollIndicator={false}>
          <Card>
            <ThemedText variant="label" className="mb-3">Foreign Investors (FIPI)</ThemedText>
            {fipi.length === 0 ? (
              <ThemedText variant="caption" className="text-muted">No data</ThemedText>
            ) : (
              fipi.map((row) => <NetRow key={row.sector} label={row.sector} net={row.net} />)
            )}
          </Card>
          <Card>
            <ThemedText variant="label" className="mb-3">Local Investors (LIPI)</ThemedText>
            {lipi.length === 0 ? (
              <ThemedText variant="caption" className="text-muted">No data</ThemedText>
            ) : (
              lipi.map((row) => <NetRow key={row.sector} label={row.sector} net={row.net} />)
            )}
          </Card>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
