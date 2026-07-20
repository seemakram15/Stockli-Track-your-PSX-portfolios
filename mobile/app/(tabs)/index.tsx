import { View, ScrollView, Pressable, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { TrendingUp, TrendingDown, RefreshCw, Search } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { Card } from "@/components/ui/ThemedView";
import { ThemedText } from "@/components/ui/ThemedText";
import { usePublicMarket } from "@/hooks/useMarket";
import { usePortfolios, useAllHoldings } from "@/hooks/usePortfolio";
import { usePrices } from "@/hooks/useMarket";
import { formatPKR, formatPercent, plColor } from "@/lib/format";

interface IndexCard {
  symbol: string;
  label: string;
  current: number;
  changePct: number;
}

interface Mover {
  symbol: string;
  company_name: string | null;
  changePct: number;
}

function IndexStrip({ indices }: { indices: IndexCard[] }) {
  return (
    <View className="flex-row gap-2">
      {indices.map((idx) => {
        const up = idx.changePct >= 0;
        const color = up ? colors.gain : colors.loss;
        return (
          <Card key={idx.symbol} className="flex-1 p-3">
            <ThemedText variant="label" className="mb-1">{idx.label}</ThemedText>
            <ThemedText variant="subhead" style={{ color: "#e2e2f0" }}>
              {idx.current.toLocaleString("en-PK", { maximumFractionDigits: 0 })}
            </ThemedText>
            <ThemedText variant="caption" style={{ color, marginTop: 2 }}>
              {up ? "+" : ""}{formatPercent(idx.changePct)}
            </ThemedText>
          </Card>
        );
      })}
    </View>
  );
}

function MoverRow({ item }: { item: Mover }) {
  const color = plColor(item.changePct);
  return (
    <Pressable
      className="flex-row items-center justify-between py-1.5"
      onPress={() => router.push(`/stock/${item.symbol}`)}
    >
      <View className="flex-1 mr-2">
        <ThemedText variant="body" numberOfLines={1}>{item.symbol}</ThemedText>
        {item.company_name ? (
          <ThemedText variant="caption" className="text-muted" numberOfLines={1}>
            {item.company_name}
          </ThemedText>
        ) : null}
      </View>
      <ThemedText variant="label" style={{ color }}>
        {item.changePct >= 0 ? "+" : ""}{formatPercent(item.changePct)}
      </ThemedText>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const { data: marketData, isLoading: marketLoading, mutate: refreshMarket } = usePublicMarket();
  const { data: portfolios = [], isLoading: portfolioLoading } = usePortfolios();
  const { data: holdings = [] } = useAllHoldings();

  const allSymbols = [...new Set(holdings.map((h) => h.symbol))];
  const { data: quotes = [] } = usePrices(allSymbols);

  const isRefreshing = marketLoading && !marketData;

  const market = (marketData as { data?: { indices?: IndexCard[]; rows?: Mover[] } } | undefined)?.data;

  const indices: IndexCard[] = (market?.indices ?? []).filter((i) =>
    ["KSE100", "KSE30", "KMI30"].includes(i.symbol)
  ).map((i) => ({
    ...i,
    label: i.symbol === "KSE100" ? "KSE 100" : i.symbol === "KSE30" ? "KSE 30" : "KMI 30",
  }));

  const rows: Mover[] = market?.rows ?? [];
  const gainers = [...rows].sort((a, b) => b.changePct - a.changePct).slice(0, 5);
  const losers = [...rows].sort((a, b) => a.changePct - b.changePct).slice(0, 5);

  const quoteMap = new Map(
    (quotes as { symbol: string; price: number; changePct: number }[]).map((q) => [q.symbol, q])
  );

  let totalValue = 0;
  let totalCost = 0;
  for (const h of holdings) {
    const q = quoteMap.get(h.symbol);
    const price = q?.price ?? h.cost_basis;
    totalValue += price * h.quantity;
    totalCost += h.cost_basis * h.quantity;
  }
  const totalPL = totalValue - totalCost;
  const totalPLPct = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;

  return (
    <SafeAreaView className="flex-1 bg-[#0f0f13]" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-4 pb-10 pt-2"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshMarket}
            tintColor={colors.accent}
          />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between py-2">
          <View>
            <ThemedText variant="label" className="mb-0.5">Pakistan Stock Exchange</ThemedText>
            <ThemedText variant="title">Dashboard</ThemedText>
          </View>
          <Pressable
            className="size-9 items-center justify-center rounded-full bg-surface"
            onPress={() => router.push("/search")}
          >
            <Search size={16} color={colors.muted} />
          </Pressable>
        </View>

        {/* KSE Index Strip */}
        {marketLoading && indices.length === 0 ? (
          <View className="flex-row gap-2">
            {["KSE 100", "KSE 30", "KMI 30"].map((label) => (
              <Card key={label} className="flex-1 p-3">
                <ThemedText variant="label" className="mb-1">{label}</ThemedText>
                <ActivityIndicator size="small" color={colors.accent} />
              </Card>
            ))}
          </View>
        ) : indices.length > 0 ? (
          <IndexStrip indices={indices} />
        ) : null}

        {/* Portfolio Summary */}
        <Card>
          <ThemedText variant="label" className="mb-3">My Portfolios</ThemedText>
          {portfolioLoading ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : portfolios.length === 0 ? (
            <ThemedText variant="caption" className="text-muted text-center py-2">
              No portfolios yet
            </ThemedText>
          ) : (
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <ThemedText variant="caption">Total Value</ThemedText>
                <ThemedText variant="subhead" style={{ color: "#e2e2f0" }}>
                  {formatPKR(totalValue)}
                </ThemedText>
              </View>
              <View className="flex-row items-center justify-between">
                <ThemedText variant="caption">Total P/L</ThemedText>
                <View className="items-end">
                  <ThemedText variant="subhead" style={{ color: plColor(totalPL) }}>
                    {totalPL >= 0 ? "+" : ""}{formatPKR(totalPL)}
                  </ThemedText>
                  <ThemedText variant="caption" style={{ color: plColor(totalPLPct) }}>
                    {totalPLPct >= 0 ? "+" : ""}{formatPercent(totalPLPct)}
                  </ThemedText>
                </View>
              </View>
              <View className="flex-row items-center justify-between">
                <ThemedText variant="caption">Portfolios</ThemedText>
                <ThemedText variant="subhead" style={{ color: "#e2e2f0" }}>
                  {portfolios.length}
                </ThemedText>
              </View>
            </View>
          )}
          <Pressable
            className="mt-4 items-center rounded-xl border border-border py-2.5"
            onPress={() => router.push("/(tabs)/portfolios")}
          >
            <ThemedText variant="label" style={{ color: colors.accent }}>
              View all portfolios
            </ThemedText>
          </Pressable>
        </Card>

        {/* Market Movers */}
        <View className="flex-row gap-2">
          <Card className="flex-1">
            <View className="mb-2 flex-row items-center gap-2">
              <TrendingUp size={14} color={colors.gain} />
              <ThemedText variant="label" style={{ color: colors.gain }}>Top Gainers</ThemedText>
            </View>
            {marketLoading && gainers.length === 0 ? (
              <ThemedText variant="caption" className="text-center text-muted py-4">Loading…</ThemedText>
            ) : gainers.length === 0 ? (
              <ThemedText variant="caption" className="text-center text-muted py-4">—</ThemedText>
            ) : (
              gainers.map((item) => <MoverRow key={item.symbol} item={item} />)
            )}
          </Card>
          <Card className="flex-1">
            <View className="mb-2 flex-row items-center gap-2">
              <TrendingDown size={14} color={colors.loss} />
              <ThemedText variant="label" style={{ color: colors.loss }}>Top Losers</ThemedText>
            </View>
            {marketLoading && losers.length === 0 ? (
              <ThemedText variant="caption" className="text-center text-muted py-4">Loading…</ThemedText>
            ) : losers.length === 0 ? (
              <ThemedText variant="caption" className="text-center text-muted py-4">—</ThemedText>
            ) : (
              losers.map((item) => <MoverRow key={item.symbol} item={item} />)
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
