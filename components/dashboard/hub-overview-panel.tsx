"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Landmark, Wallet } from "lucide-react";
import {
  HubComparisonChart,
  type HubSeriesInput,
} from "@/components/charts/hub-comparison-chart";
import { Sparkline } from "@/components/charts/sparkline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconChip } from "@/components/ui/accent";
import { Skeleton } from "@/components/ui/skeleton";
import { isClosedMarketSnapshotCurrent, isPortfolioCacheFresh } from "@/lib/cache/portfolio-mutations";
import {
  formatNumber,
  formatPercent,
  formatPKR,
  formatSigned,
  plColorClass,
} from "@/lib/format";
import { useLiveHoldings } from "@/lib/hooks/use-live-holdings";
import {
  usePersistentResource,
  type CachedRecord,
} from "@/lib/hooks/use-persistent-resource";
import { shouldRefreshPsxData } from "@/lib/psx/market-hours";
import { computeSummary } from "@/lib/services/metrics";
import type { PerfPoint, PerformanceResult } from "@/lib/services/performance";
import type { HoldingWithMetrics, Portfolio, PortfolioSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

type HubIndexSeriesPayload = {
  indexes: Array<{
    symbol: "KSE100" | "KMI30" | "KSE30";
    closes: Array<{ date: string; close: number }>;
  }>;
  updatedAt: string;
};

const PORTFOLIO_COLORS = [
  "var(--chart-1)",
  "var(--primary)",
  "var(--chart-5)",
  "hsl(28 90% 52%)",
  "hsl(280 70% 55%)",
];

const INDEX_SERIES_META = [
  { symbol: "KSE100" as const, key: "kse100", name: "KSE-100", color: "var(--chart-2)" },
  { symbol: "KMI30" as const, key: "kmi30", name: "KMI-30", color: "var(--chart-3)" },
  { symbol: "KSE30" as const, key: "kse30", name: "KSE-30", color: "var(--chart-4)" },
];

type DashboardPayload = {
  dashboard: {
    summary: PortfolioSummary;
    portfolios: Array<Pick<Portfolio, "id" | "name">>;
    holdings: HoldingWithMetrics[];
  };
  updatedAt: string;
};

type IndexCardLike = {
  symbol: string;
  name: string;
  current: number;
  change: number;
  changePct: number;
  spark?: number[];
};

type IndexCandle = { time: number; close: number };

type IndexHistory = {
  symbol: string;
  spark: number[];
  closes: Array<{ date: string; close: number }>;
};

const INDEX_META = {
  KSE100: { label: "KSE 100", short: "Benchmark", accent: "emerald" as const },
  KMI30: { label: "KMI 30", short: "Shariah", accent: "sky" as const },
  KSE30: { label: "KSE 30", short: "Blue chips", accent: "violet" as const },
} as const;

type IndexSymbol = keyof typeof INDEX_META;

export function HubOverviewPanel({
  portfolio,
  indexCards,
  kse100Candles,
  marketLabel,
  marketStatusLabel,
  userId,
}: {
  portfolio?: DashboardPayload;
  indexCards?: IndexCardLike[];
  /** Optional ATF seed from public market detail so KSE100 paints with portfolios. */
  kse100Candles?: IndexCandle[];
  marketLabel: string;
  marketStatusLabel: string;
  userId: string;
}) {
  const holdings = portfolio?.dashboard.holdings ?? [];
  const portfolios = portfolio?.dashboard.portfolios ?? [];
  const { liveHoldings } = useLiveHoldings(holdings);
  const summary = React.useMemo(
    () => computeSummary(liveHoldings, portfolio?.dashboard.summary.realizedPL ?? 0),
    [liveHoldings, portfolio?.dashboard.summary.realizedPL]
  );

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

  // Same cache-first path as portfolios — lightweight closes only (no constituents).
  const { data: indexSeries } = usePersistentResource<HubIndexSeriesPayload>({
    cacheKey: "public:hub-index-series:v1",
    url: "/api/public/hub-index-series",
    refreshInterval: 60_000,
    pauseWhen: cacheClosedOnly,
    acceptCacheWhen: acceptIndexCache,
  });

  const indexes = React.useMemo(() => {
    return (["KSE100", "KMI30", "KSE30"] as const).map((symbol) => {
      const card = indexCards?.find((item) => item.symbol.toUpperCase() === symbol) ?? null;
      return { symbol, card };
    });
  }, [indexCards]);

  const histories = React.useMemo(() => {
    const next: Partial<Record<IndexSymbol, IndexHistory>> = {};

    // Prefer cached/fetched series; seed KSE100 from ATF market detail when present.
    if (kse100Candles?.length) {
      const closes = candlesToCloses(kse100Candles);
      if (closes.length >= 2) {
        next.KSE100 = {
          symbol: "KSE100",
          spark: closes.slice(-32).map((item) => item.close),
          closes,
        };
      }
    }

    for (const item of indexSeries?.indexes ?? []) {
      const symbol = item.symbol as IndexSymbol;
      if (!(symbol in INDEX_META)) continue;
      if (item.closes.length < 2) continue;
      next[symbol] = {
        symbol,
        spark: item.closes.slice(-32).map((row) => row.close),
        closes: item.closes,
      };
    }

    return next;
  }, [indexSeries, kse100Candles]);

  const chartSeries = React.useMemo(
    () => buildHubSeries(perfData ?? null, histories),
    [perfData, histories]
  );

  const portfolioSpark = React.useMemo(() => {
    if (!perfData?.points.length) return [];
    const portfolioKeys = perfData.series
      .filter((item) => item.kind === "portfolio")
      .map((item) => item.key);
    if (!portfolioKeys.length) return [];
    return perfData.points
      .map((point) => averageNumeric(point, portfolioKeys))
      .filter((value): value is number => value != null)
      .slice(-32);
  }, [perfData]);

  const investedSpark = React.useMemo(() => {
    if (!perfData?.points.length) return [];
    const keys = perfData.series.filter((item) => item.kind === "portfolio").map((item) => item.key);
    return perfData.points
      .map((point) => averageNumeric(point, keys))
      .filter((value): value is number => value != null)
      .slice(-32)
      .map((value, index, arr) => value - (arr[0] ?? 0));
  }, [perfData]);

  return (
    <section className="grid gap-4 lg:grid-cols-12 lg:items-stretch">
      {/* Left — portfolio amounts */}
      <Card className="order-1 flex flex-col overflow-hidden border-border/70 lg:col-span-3">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-start gap-2.5">
              <IconChip accent="violet" size="sm" className="rounded-xl">
                <Wallet className="size-4" />
              </IconChip>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Your books
                </p>
                <CardTitle className="mt-1 text-base sm:text-lg">Portfolio</CardTitle>
              </div>
            </div>
            <Button asChild variant="ghost" size="icon" className="size-8 shrink-0">
              <Link href="/portfolios" aria-label="Open portfolios">
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3 pt-0">
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-1 lg:gap-3">
            <MetricBlock
              label="Day's P/L"
              value={formatPKR(summary.dayPL, { sign: true })}
              badge={formatPercent(summary.dayPLPct)}
              tone={summary.dayPL}
              spark={portfolioSpark}
              filled
            />
            <MetricBlock
              label="Total P/L"
              value={formatPKR(summary.totalPL, { sign: true })}
              badge={formatPercent(summary.totalPLPct)}
              tone={summary.totalPL}
              spark={portfolioSpark}
              filled
            />
            <MetricBlock
              label="Market Value"
              value={formatPKR(summary.totalValue)}
              valueClassName="text-amber-600 dark:text-amber-400"
              spark={portfolioSpark}
            />
            <MetricBlock
              label="Invested"
              value={formatPKR(summary.totalInvested)}
              valueClassName="text-amber-600 dark:text-amber-400"
              badge={`${portfolios.length} workspace${portfolios.length === 1 ? "" : "s"}`}
              spark={investedSpark.length > 1 ? investedSpark : portfolioSpark}
            />
          </div>
          <div className="mt-auto border-t border-border/60 pt-3">
            <Button asChild variant="outline" size="sm" className="h-8 w-full">
              <Link href="/portfolios">Manage portfolios</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Center — comparison chart */}
      <Card className="order-3 flex flex-col overflow-hidden border-border/70 lg:order-2 lg:col-span-6">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Return comparison
              </p>
              <CardTitle className="mt-1 text-base sm:text-lg">
                Portfolios vs indexes
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Each portfolio vs KSE100, KMI30 and KSE30 — period returns by range
              </p>
            </div>
            <StatusChip label={marketStatusLabel} />
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col pt-0">
          <HubComparisonChart
            series={chartSeries}
            height={280}
            className="min-h-[20rem] flex-1"
          />
        </CardContent>
      </Card>

      {/* Right — key indexes */}
      <Card className="order-2 flex flex-col overflow-hidden border-border/70 lg:order-3 lg:col-span-3">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-start gap-2.5">
              <IconChip accent="primary" size="sm" className="rounded-xl">
                <Landmark className="size-4" />
              </IconChip>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Pakistan Stock Exchange
                </p>
                <CardTitle className="mt-1 text-base sm:text-lg">Key indexes</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">{marketLabel}</p>
              </div>
            </div>
            <Button asChild variant="ghost" size="icon" className="size-8 shrink-0">
              <Link href="/market" aria-label="Open PSX market">
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-2.5 pt-0">
          {indexes.some((item) => item.card) ? (
            indexes.map(({ symbol, card }) => {
              const meta = INDEX_META[symbol];
              const history = histories[symbol];
              const spark = history?.spark?.length
                ? history.spark
                : card?.spark?.length
                  ? card.spark
                  : card
                    ? [card.current - card.change, card.current]
                    : [];
              if (!card) {
                return (
                  <div
                    key={symbol}
                    className="rounded-2xl border border-dashed border-border/70 px-3 py-4 text-center text-xs text-muted-foreground"
                  >
                    {meta.label} unavailable
                  </div>
                );
              }
              return (
                <Link
                  key={symbol}
                  href="/market"
                  className="group rounded-2xl border border-border/70 bg-background/70 px-3 py-3 transition hover:border-emerald-500/30 hover:bg-emerald-500/[0.04]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex size-8 items-center justify-center rounded-full text-[10px] font-bold",
                            meta.accent === "emerald" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                            meta.accent === "sky" && "bg-sky-500/15 text-sky-700 dark:text-sky-300",
                            meta.accent === "violet" && "bg-violet-500/15 text-violet-700 dark:text-violet-300"
                          )}
                        >
                          {symbol.replace(/\d+$/, "").slice(0, 3)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">{meta.label}</p>
                          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                            {meta.short}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-xl font-bold tabular-nums tracking-tight">
                        {formatNumber(card.current, 2)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                          card.changePct < 0
                            ? "bg-loss/10 text-loss"
                            : card.changePct > 0
                              ? "bg-gain/10 text-gain"
                              : "bg-muted text-muted-foreground"
                        )}
                      >
                        {formatPercent(card.changePct)}
                      </span>
                      <span className={cn("text-xs font-semibold tabular-nums", plColorClass(card.change))}>
                        {formatSigned(card.change, 2)} pts
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 h-10 w-full overflow-hidden">
                    {spark.length > 1 ? (
                      <Sparkline data={spark} width={220} height={40} className="h-full w-full" />
                    ) : (
                      <Skeleton className="h-full w-full rounded-lg" />
                    )}
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border/70 text-sm text-muted-foreground">
              Loading indexes…
            </div>
          )}
          <div className="mt-auto border-t border-border/60 pt-3">
            <Button asChild variant="outline" size="sm" className="h-8 w-full">
              <Link href="/market">Open PSX market</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function MetricBlock({
  label,
  value,
  badge,
  tone,
  valueClassName,
  spark,
  filled = false,
}: {
  label: string;
  value: string;
  badge?: string;
  tone?: number;
  valueClassName?: string;
  spark?: number[];
  filled?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 px-3 py-3",
        filled ? "bg-background/80" : "bg-muted/20"
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-1.5 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p
            className={cn(
              "truncate text-base font-bold tabular-nums tracking-tight sm:text-lg lg:text-xl",
              tone != null ? plColorClass(tone) : valueClassName
            )}
          >
            {value}
          </p>
          {badge ? (
            <p
              className={cn(
                "mt-0.5 text-xs font-medium tabular-nums",
                tone != null ? plColorClass(tone) : "text-muted-foreground"
              )}
            >
              {badge}
            </p>
          ) : null}
        </div>
        {spark && spark.length > 1 ? (
          <Sparkline data={spark} width={72} height={28} className="hidden shrink-0 lg:block" />
        ) : null}
      </div>
    </div>
  );
}

function StatusChip({ label }: { label: string }) {
  const live = /open|pre-open|settling/i.test(label);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]",
        live
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-border bg-muted/50 text-muted-foreground"
      )}
    >
      <span className={cn("size-1.5 rounded-full", live ? "animate-pulse bg-emerald-500" : "bg-muted-foreground/50")} />
      Status: {label}
    </span>
  );
}

function buildHubSeries(
  perf: PerformanceResult | null,
  histories: Partial<Record<IndexSymbol, IndexHistory>>
): HubSeriesInput[] {
  const series: HubSeriesInput[] = [];

  for (const meta of INDEX_SERIES_META) {
    const closes = histories[meta.symbol]?.closes ?? [];
    if (closes.length >= 2) {
      series.push({
        key: meta.key,
        name: meta.name,
        color: meta.color,
        kind: "benchmark",
        levels: closes.map((item) => ({ date: item.date, value: item.close })),
      });
      continue;
    }

    // Instant fallback: KSE100 already arrives with portfolio-performance.
    if (meta.symbol === "KSE100" && perf?.points.length) {
      const levels = perf.points
        .map((point) => {
          const cum = point.kse100;
          if (typeof cum !== "number" || !Number.isFinite(cum)) return null;
          return { date: point.date, value: 100 * (1 + cum / 100) };
        })
        .filter((point): point is { date: string; value: number } => point != null);
      if (levels.length >= 2) {
        series.push({
          key: meta.key,
          name: meta.name,
          color: meta.color,
          kind: "benchmark",
          levels,
        });
      }
    }
  }

  const portfolioSeries = perf?.series.filter((item) => item.kind === "portfolio") ?? [];
  portfolioSeries.forEach((item, index) => {
    // Reconstruct a relative level series from cumulative % so period returns work.
    const levels = (perf?.points ?? [])
      .map((point) => {
        const cum = point[item.key];
        if (typeof cum !== "number" || !Number.isFinite(cum)) return null;
        return {
          date: point.date,
          value: 100 * (1 + cum / 100),
        };
      })
      .filter((point): point is { date: string; value: number } => point != null);

    if (levels.length < 2) return;
    series.push({
      key: item.key,
      name: item.name,
      color: item.color || PORTFOLIO_COLORS[index % PORTFOLIO_COLORS.length],
      kind: "portfolio",
      levels,
    });
  });

  return series;
}

function candlesToCloses(candles: IndexCandle[]) {
  const byDate = new Map<string, number>();
  for (const candle of candles) {
    if (!Number.isFinite(candle.close)) continue;
    const date = new Date(candle.time * 1000).toISOString().slice(0, 10);
    byDate.set(date, candle.close);
  }
  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, close]) => ({ date, close }));
}

function averageNumeric(point: PerfPoint, keys: string[]) {
  const values = keys
    .map((key) => point[key])
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (!values.length) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100) / 100;
}
