import { useState, useCallback } from "react";
import { View, TextInput, FlatList, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, Search, TrendingUp, Globe2, BarChart3, Tag } from "lucide-react-native";
import { colors } from "@/lib/theme";
import { ThemedText } from "@/components/ui/ThemedText";
import { useSearch } from "@/hooks/useMarket";

type ResultKind = "stock" | "mutual-fund" | "etf" | "index" | "commodity" | "crypto" | "sector" | "page";

interface SearchResult {
  id: string;
  kind: ResultKind;
  title: string;
  subtitle: string | null;
  symbol: string;
  category: string;
}

const KIND_ICON: Record<ResultKind, typeof TrendingUp> = {
  stock: TrendingUp,
  index: BarChart3,
  "mutual-fund": Tag,
  etf: Tag,
  commodity: Globe2,
  crypto: Globe2,
  sector: BarChart3,
  page: Globe2,
};

const KIND_COLOR: Record<ResultKind, string> = {
  stock: colors.accent,
  index: colors.sky,
  "mutual-fund": colors.warn,
  etf: colors.warn,
  commodity: colors.gain,
  crypto: "#f59e0b",
  sector: colors.muted,
  page: colors.muted,
};

function ResultRow({ item, onPress }: { item: SearchResult; onPress: () => void }) {
  const Icon = KIND_ICON[item.kind] ?? Tag;
  const iconColor = KIND_COLOR[item.kind] ?? colors.muted;
  return (
    <Pressable
      className="flex-row items-center gap-3 py-3 px-4 border-b border-border active:opacity-70"
      onPress={onPress}
    >
      <View
        className="size-8 rounded-lg items-center justify-center"
        style={{ backgroundColor: `${iconColor}22` }}
      >
        <Icon size={14} color={iconColor} />
      </View>
      <View className="flex-1">
        <ThemedText variant="body" numberOfLines={1}>{item.title}</ThemedText>
        {item.subtitle ? (
          <ThemedText variant="caption" className="text-muted" numberOfLines={1}>
            {item.subtitle}
          </ThemedText>
        ) : null}
      </View>
      <ThemedText variant="caption" className="text-muted capitalize">
        {item.kind.replace("-", " ")}
      </ThemedText>
    </Pressable>
  );
}

function navigateToResult(item: SearchResult) {
  if (item.kind === "stock" && item.symbol) {
    router.push(`/stock/${item.symbol}`);
  } else if (item.kind === "index" && item.symbol) {
    router.push(`/stock/${item.symbol}`);
  } else {
    router.push("/(tabs)/markets");
  }
}

export default function SearchScreen() {
  const [query, setQuery] = useState("");

  const { data, isLoading } = useSearch(query);
  const results: SearchResult[] = (data as { results?: SearchResult[] } | undefined)?.results ?? [];

  return (
    <SafeAreaView className="flex-1 bg-[#0f0f13]" edges={["top"]}>
      {/* Search bar */}
      <View className="flex-row items-center gap-2 px-4 pt-2 pb-3">
        <Pressable onPress={() => router.back()} className="size-9 items-center justify-center">
          <ArrowLeft size={20} color={colors.text} />
        </Pressable>
        <View className="flex-1 flex-row items-center gap-2 rounded-xl bg-surface border border-border px-3 py-2.5">
          <Search size={16} color={colors.muted} />
          <TextInput
            className="flex-1 text-[#e2e2f0] text-[16px]"
            placeholder="Search stocks, funds, indices…"
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {query.trim().length < 2 ? (
        <View className="flex-1 items-center justify-center gap-2">
          <Search size={40} color={colors.muted} />
          <ThemedText variant="body" className="text-muted">Type to search</ThemedText>
        </View>
      ) : isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : results.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-2">
          <ThemedText variant="body" className="text-muted">No results for "{query}"</ThemedText>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ResultRow item={item} onPress={() => navigateToResult(item)} />
          )}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="pb-10"
        />
      )}
    </SafeAreaView>
  );
}
