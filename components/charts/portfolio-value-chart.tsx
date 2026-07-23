"use client";

import * as React from "react";
import {
  HubComparisonChart,
  type HubSeriesInput,
} from "@/components/charts/hub-comparison-chart";
import {
  isClosedMarketSnapshotCurrent,
  isPortfolioCacheFresh,
} from "@/lib/cache/portfolio-mutations";
import {
  usePersistentResource,
  type CachedRecord,
} from "@/lib/hooks/use-persistent-resource";
import { shouldRefreshPsxData } from "@/lib/psx/market-hours";
import type { PerformanceResult } from "@/lib/services/performance";

type HubIndexSeriesPayload = {
  indexes: Array<{
    symbol: "KSE100" | "KMI30" | "KSE30";
    closes: Array<{ date: string; close: number }>;
  }>;
  updatedAt: string;
};

const INDEX_META = [
  { symbol: "KSE100" as const, key: "kse100", name: "KSE-100", color: "var(--chart-2)" },
  { symbol: "KMI30" as const, key: "kmi30", name: "KMI-30", color: "var(--chart-3)" },
  { symbol: "KSE30" as const, key: "kse30", name: "KSE-30", color: "var(--chart-4)" },
];

/** Must match `seriesKey` in lib/services/performance.ts */
function portfolioSeriesKey(id: string) {
  return `portfolio_${id.replace(/[^a-zA-Z0-9]/g, "_")}`;
}

/**
 * Same full-history return series as the dashboard hub chart: simulated
 * portfolio value from current holdings across all EOD history, plus KSE100 /
 * KMI30 / KSE30 closes — not limited to the trade calendar window.
 */
export function PortfolioValueChart({
  portfolioId,
  portfolioName = "Portfolio",
  userId,
  height = 280,
}: {
  portfolioId: string;
  portfolioName?: string;
  userId: string;
  height?: number;
}) {
  const cacheClosedOnly = React.useCallback(() => !shouldRefreshPsxData(), []);
  const acceptPerfCache = React.useCallback(
    (record: CachedRecord<PerformanceResult>) =>
      cacheClosedOnly() && isPortfolioCacheFresh(record, userId),
    [cacheClosedOnly, userId]
  );
  const acceptIndexCache = React.useCallback(
    (record: CachedRecord<HubIndexSeriesPayload>) =>
      cacheClosedOnly() && isClosedMarketSnapshotCurrent(record),
    [cacheClosedOnly]
  );

  const { data: perfData } = usePersistentResource<PerformanceResult>({
    cacheKey: `private:portfolio-performance:${userId}`,
    url: "/api/private/portfolio-performance",
    refreshInterval: 60_000,
    pauseWhen: cacheClosedOnly,
    acceptCacheWhen: acceptPerfCache,
  });

  const { data: indexSeries } = usePersistentResource<HubIndexSeriesPayload>({
    cacheKey: "public:hub-index-series:v1",
    url: "/api/public/hub-index-series",
    refreshInterval: 60_000,
    pauseWhen: cacheClosedOnly,
    acceptCacheWhen: acceptIndexCache,
  });

  const series = React.useMemo(() => {
    const next: HubSeriesInput[] = [];
    const perfKey = portfolioSeriesKey(portfolioId);

    for (const meta of INDEX_META) {
      const closes =
        indexSeries?.indexes.find((item) => item.symbol === meta.symbol)?.closes ?? [];
      if (closes.length < 2) continue;
      next.push({
        key: meta.key,
        name: meta.name,
        color: meta.color,
        kind: "benchmark",
        levels: closes.map((item) => ({ date: item.date, value: item.close })),
      });
    }

    // Prefer absolute index closes for KSE100; fall back to performance cum %
    // only if hub index series hasn't painted yet.
    if (!next.some((item) => item.key === "kse100") && perfData?.points.length) {
      const levels = levelsFromCumulative(perfData.points, "kse100");
      if (levels.length >= 2) {
        next.unshift({
          key: "kse100",
          name: "KSE-100",
          color: "var(--chart-2)",
          kind: "benchmark",
          levels,
        });
      }
    }

    const portfolioMeta = perfData?.series.find(
      (item) => item.kind === "portfolio" && item.key === perfKey
    );
    const portfolioLevels = levelsFromCumulative(perfData?.points ?? [], perfKey);
    if (portfolioLevels.length >= 2) {
      next.push({
        key: "portfolio",
        name: portfolioMeta?.name || portfolioName,
        color: portfolioMeta?.color || "var(--chart-1)",
        kind: "portfolio",
        levels: portfolioLevels,
      });
    }

    return next;
  }, [indexSeries, perfData, portfolioId, portfolioName]);

  if (!series.some((item) => item.levels.length > 1)) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border border-dashed border-border/70 text-sm text-muted-foreground"
        style={{ minHeight: height }}
      >
        Trend data will appear once history loads
      </div>
    );
  }

  return (
    <HubComparisonChart
      series={series}
      height={height}
      benchmarkPicker
      dialogTitle="Portfolio vs indexes"
      dialogDescription="Full-history period returns vs KSE100, KMI30 and KSE30 — same series as the dashboard"
      className="min-h-[20rem]"
    />
  );
}

function levelsFromCumulative(
  points: Array<{ date: string; [key: string]: number | string | null | undefined }>,
  key: string
) {
  return points
    .map((point) => {
      const cum = point[key];
      if (typeof cum !== "number" || !Number.isFinite(cum)) return null;
      return {
        date: point.date,
        value: 100 * (1 + cum / 100),
      };
    })
    .filter((point): point is { date: string; value: number } => point != null);
}
