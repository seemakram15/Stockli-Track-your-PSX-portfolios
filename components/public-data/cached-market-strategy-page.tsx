"use client";

import { Award, ExternalLink, Target, TrendingDown, TrendingUp } from "lucide-react";
import { CacheStatusBadge } from "@/components/cache/cache-status-badge";
import { EmptyState } from "@/components/empty-state";
import { PageLoadingState } from "@/components/loading/page-loading-state";
import { MarketStrategyBoard } from "@/components/market/market-strategy-board";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { DataDelayBadge } from "@/components/status-badges";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatNumber, formatPKR, formatSigned, plColorClass } from "@/lib/format";
import { usePersistentResource } from "@/lib/hooks/use-persistent-resource";
import { shouldRefreshPsxData } from "@/lib/psx/market-hours";
import { cn } from "@/lib/utils";
import type { MarketStrategyData } from "@/lib/services/market-strategy";

export function CachedMarketStrategyPage() {
  const { data, error, isLoading, isRefreshing, isFromDeviceCache, cachedAt } =
    usePersistentResource<MarketStrategyData>({
      cacheKey: "public:market-strategy",
      url: "/api/public/market-strategy",
      refreshInterval: 5 * 60_000,
      pauseWhen: () => !shouldRefreshPsxData(),
      acceptCacheWhen: () => !shouldRefreshPsxData(),
    });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        icon={<Target />}
        eyebrow="Funds daily returns"
        accent="violet"
        title="Funds Daily Returns Report"
        description={
          data
            ? `Estimated fund returns per ${formatPKR(data.investmentAmount)} from MUFAP daily performance.`
            : "Estimated stock fund returns from MUFAP daily performance."
        }
        actions={
          <>
            <DataDelayBadge />
            <CacheStatusBadge
              updatedAt={data?.updatedAt}
              cachedAt={cachedAt}
              isFromDeviceCache={isFromDeviceCache}
              isRefreshing={isRefreshing}
            />
            {data?.sourceUrl ? (
              <Button asChild variant="outline">
                <a href={data.sourceUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  MUFAP source
                </a>
              </Button>
            ) : null}
          </>
        }
      />

      {data ? (
        <>
          <div className="flex flex-wrap gap-2">
            {data.indexBadges.map((index) => (
              <span
                key={index.symbol}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium shadow-soft"
              >
                <span className="text-muted-foreground">{index.symbol}</span>{" "}
                <span className="tabular-nums">{formatNumber(index.current, 0)}</span>{" "}
                <span className={cn("tabular-nums", plColorClass(index.change))}>
                  {formatSigned(index.change, 2)}
                </span>
              </span>
            ))}
            <span className="rounded-full border border-border bg-muted/30 px-3 py-1.5 text-sm text-muted-foreground">
              Updated {formatDateTime(data.updatedAt)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard
              label="Average estimate"
              value={formatPKR(data.summary.avgEstimatedReturn, { sign: true })}
              tone={toneOf(data.summary.avgEstimatedReturn)}
              accent="violet"
              icon={<Target className="size-4" />}
            />
            <StatCard
              label="Positive funds"
              value={String(data.summary.positiveCount)}
              tone="gain"
              accent="emerald"
              icon={<TrendingUp className="size-4" />}
            />
            <StatCard
              label="Negative funds"
              value={String(data.summary.negativeCount)}
              tone="loss"
              accent="rose"
              icon={<TrendingDown className="size-4" />}
            />
            <StatCard
              label="Best fund"
              value={data.summary.best ? formatPKR(data.summary.best.estimatedReturn, { sign: true }) : "-"}
              tone={toneOf(data.summary.best?.estimatedReturn)}
              accent="amber"
              icon={<Award className="size-4" />}
              sub={data.summary.best?.name ? <span className="truncate text-muted-foreground">{data.summary.best.name}</span> : undefined}
            />
          </div>

          <MarketStrategyBoard data={data} />
        </>
      ) : isLoading ? (
        <PageLoadingState message="Loading funds daily returns report..." variant="strategy" />
      ) : (
        <EmptyState
          icon={<Target className="size-6" />}
          title="Funds daily returns report unavailable"
          description={
            error?.message ??
            "The saved cache is empty and fresh fund return data could not be loaded. Please try again shortly."
          }
        />
      )}
    </div>
  );
}

function toneOf(value: number | null | undefined): "gain" | "loss" | "default" {
  if (value == null || Number.isNaN(value)) return "default";
  if (value > 0) return "gain";
  if (value < 0) return "loss";
  return "default";
}
