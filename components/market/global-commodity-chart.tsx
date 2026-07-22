"use client";

import * as React from "react";
import { PriceLineChart } from "@/components/charts/price-line-chart";
import { ChartSwitchLoader, useChartSwitchLoader } from "@/lib/hooks/use-chart-switch-loader";
import { usePersistentResource } from "@/lib/hooks/use-persistent-resource";
import type { HistoryPoint } from "@/app/api/public/commodity-history/route";

const GLOBAL_OPTIONS = [
  { label: "Gold",      symbol: "GC=F",  unit: "$", fmt: (v: number) => v.toFixed(2) },
  { label: "Silver",    symbol: "SI=F",  unit: "$", fmt: (v: number) => v.toFixed(3) },
  { label: "Copper",    symbol: "HG=F",  unit: "$", fmt: (v: number) => v.toFixed(4) },
  { label: "Platinum",  symbol: "PL=F",  unit: "$", fmt: (v: number) => v.toFixed(2) },
  { label: "Palladium", symbol: "PA=F",  unit: "$", fmt: (v: number) => v.toFixed(2) },
  { label: "Corn",      symbol: "ZC=F",  unit: "$", fmt: (v: number) => v.toFixed(2) },
  { label: "Wheat",     symbol: "ZW=F",  unit: "$", fmt: (v: number) => v.toFixed(2) },
  { label: "Soybeans",  symbol: "ZS=F",  unit: "$", fmt: (v: number) => v.toFixed(2) },
  { label: "Coffee",    symbol: "KC=F",  unit: "$", fmt: (v: number) => v.toFixed(2) },
] as const;

type ChartSymbol = (typeof GLOBAL_OPTIONS)[number]["symbol"];

export interface GlobalCommodityChartHandle {
  refresh(): Promise<void>;
}

export const GlobalCommodityChart = React.forwardRef<GlobalCommodityChartHandle>(
  function GlobalCommodityChart(_, ref) {
    const [symbol, setSymbol] = React.useState<ChartSymbol>("GC=F");

    const { data, isLoading, refreshNow } = usePersistentResource<HistoryPoint[]>({
      cacheKey: `public:commodity-history-v4:${symbol}`,
      url: `/api/public/commodity-history?symbol=${symbol}`,
      refreshInterval: 4 * 60 * 60 * 1000,
      keepPreviousData: false,
    });

    const { showLoader, beginSwitch } = useChartSwitchLoader(symbol, data, isLoading);

    React.useImperativeHandle(ref, () => ({
      refresh: () => refreshNow().then(() => undefined),
    }), [refreshNow]);

    const active = GLOBAL_OPTIONS.find((o) => o.symbol === symbol)!;

    const selectSymbol = (next: ChartSymbol) => {
      if (next === symbol) return;
      beginSwitch();
      setSymbol(next);
    };

    return (
      <div className="flex h-[300px] flex-col overflow-hidden rounded-xl border border-border bg-muted/10 p-3">
        <div className="mb-3 flex h-8 shrink-0 gap-1 overflow-x-auto scrollbar-thin">
          {GLOBAL_OPTIONS.map((opt) => (
            <button
              key={opt.symbol}
              type="button"
              onClick={() => selectSymbol(opt.symbol)}
              className={
                "shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors " +
                (symbol === opt.symbol
                  ? "border-sky-500/40 bg-sky-500/15 text-sky-400"
                  : "border-border bg-muted/40 text-muted-foreground hover:text-foreground")
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1">
          {showLoader ? (
            <ChartSwitchLoader
              label={`${active.label} chart`}
              accentClassName="border-sky-500/30 border-t-sky-500"
            />
          ) : (
            <PriceLineChart
              key={symbol}
              data={data ?? []}
              color="hsl(199 89% 48%)"
              height={180}
              unit={active.unit}
              label={`${active.label} (USD)`}
              formatPrice={active.fmt}
              defaultDuration="1Y"
            />
          )}
        </div>
      </div>
    );
  }
);
