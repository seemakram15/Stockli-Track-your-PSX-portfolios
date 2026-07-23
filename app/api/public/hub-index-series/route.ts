import { NextResponse } from "next/server";
import { psxLiveCacheTtlSeconds, shouldRefreshPsxData } from "@/lib/psx/market-hours";
import { getEodCandlesCached } from "@/lib/services/history";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HUB_INDEX_SYMBOLS = ["KSE100", "KMI30", "KSE30"] as const;

export type HubIndexSeriesPayload = {
  indexes: Array<{
    symbol: (typeof HUB_INDEX_SYMBOLS)[number];
    closes: Array<{ date: string; close: number }>;
  }>;
  updatedAt: string;
};

/** Lightweight EOD closes for hub comparison chart — no constituents. */
export async function GET() {
  const indexes = await Promise.all(
    HUB_INDEX_SYMBOLS.map(async (symbol) => {
      const candles = await getEodCandlesCached(symbol);
      const byDate = new Map<string, number>();
      for (const candle of candles) {
        if (!Number.isFinite(candle.close)) continue;
        const date = new Date(candle.time * 1000).toISOString().slice(0, 10);
        byDate.set(date, candle.close);
      }
      return {
        symbol,
        closes: Array.from(byDate.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, close]) => ({ date, close })),
      };
    })
  );

  const data: HubIndexSeriesPayload = {
    indexes,
    updatedAt: new Date().toISOString(),
  };

  const ttl = psxLiveCacheTtlSeconds();
  return NextResponse.json(
    { data },
    {
      headers: {
        "Cache-Control": shouldRefreshPsxData()
          ? "s-maxage=60, stale-while-revalidate=180"
          : `s-maxage=${ttl}, stale-while-revalidate=${ttl}`,
      },
    }
  );
}
