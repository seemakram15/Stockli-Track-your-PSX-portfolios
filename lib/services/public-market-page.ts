import "server-only";
import { getStaleCached } from "@/lib/cache/stale";
import { marketStatus, psxLiveCacheTtlSeconds, shouldRefreshPsxData } from "@/lib/psx/market-hours";
import {
  getIndexCards,
  getIndexDetail,
  getMarketAnalytics,
  type IndexCard,
  type IndexDetail,
  type MarketAnalytics,
} from "@/lib/services/market";

export interface PublicMarketPageData {
  cards: IndexCard[];
  detail: IndexDetail | null;
  analytics: MarketAnalytics;
  market: ReturnType<typeof marketStatus>;
  updatedAt: string;
}

export async function getPublicMarketPageData(): Promise<PublicMarketPageData> {
  const cached = await getStaleCached({
    // v3: KSE100 includes Yahoo history back to 1997
    key: "public-page:psx-market:v3",
    ttlSeconds: psxLiveCacheTtlSeconds(),
    staleSeconds: shouldRefreshPsxData() ? 15 * 60 : psxLiveCacheTtlSeconds(),
    load: loadPublicMarketPageData,
    isUsable: (data) => {
      if (!data.detail || !data.cards.length) return false;
      const n = data.detail.candles?.length ?? 0;
      if (data.detail.symbol === "KSE100") return n >= 1400;
      return n > 300;
    },
  });

  return {
    ...cached.value,
    market: marketStatus(),
  };
}

async function loadPublicMarketPageData(): Promise<PublicMarketPageData> {
  const [cards, detail, analytics] = await Promise.all([
    getIndexCards(),
    getIndexDetail("KSE100"),
    getMarketAnalytics(),
  ]);

  return {
    cards,
    detail,
    analytics,
    market: marketStatus(),
    updatedAt: new Date().toISOString(),
  };
}
