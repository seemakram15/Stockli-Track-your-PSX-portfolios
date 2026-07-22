"use client";

import * as React from "react";
import { Boxes, TrendingDown, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { PriceLineChart } from "@/components/charts/price-line-chart";
import { IconChip } from "@/components/ui/accent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePersistentResource } from "@/lib/hooks/use-persistent-resource";
import { ChartSwitchLoader, useChartSwitchLoader } from "@/lib/hooks/use-chart-switch-loader";
import type { PkCommoditiesData } from "@/lib/services/pakistan-commodities";
import type { PkRawMaterialsData } from "@/lib/services/pakistan-raw-materials";
import type { HistoryPoint } from "@/app/api/public/commodity-history/route";

const PK_CHART_OPTIONS = [
  { label: "Gold 24K / Tola",   symbol: "PK-GOLD-TOLA",     unit: "Rs ", fmt: (v: number) => v.toLocaleString("en-PK", { maximumFractionDigits: 0 }) },
  { label: "Silver / Tola",     symbol: "PK-SILVER-TOLA",    unit: "Rs ", fmt: (v: number) => v.toLocaleString("en-PK", { maximumFractionDigits: 0 }) },
  { label: "Copper / kg",       symbol: "PK-COPPER-KG",      unit: "Rs ", fmt: (v: number) => v.toLocaleString("en-PK", { maximumFractionDigits: 0 }) },
  { label: "Platinum / Tola",   symbol: "PK-PLATINUM-TOLA",  unit: "Rs ", fmt: (v: number) => v.toLocaleString("en-PK", { maximumFractionDigits: 0 }) },
] as const;

type ChartSymbol = (typeof PK_CHART_OPTIONS)[number]["symbol"];

const RAW_CHART_OPTIONS = [
  { label: "Coal / MT",     symbol: "PK-COAL",   unit: "Rs ", fmt: (v: number) => v.toLocaleString("en-PK", { maximumFractionDigits: 0 }) },
  { label: "Urea / 50kg",  symbol: "PK-UREA",   unit: "Rs ", fmt: (v: number) => v.toLocaleString("en-PK", { maximumFractionDigits: 0 }) },
  { label: "Cement / 50kg",symbol: "PK-CEMENT-V3", unit: "Rs ", fmt: (v: number) => v.toLocaleString("en-PK", { maximumFractionDigits: 0 }) },
] as const;

type RawChartSymbol = (typeof RAW_CHART_OPTIONS)[number]["symbol"];

const CATEGORY_STYLES: Record<string, { dot: string; label: string }> = {
  construction: { dot: "bg-orange-400",  label: "Construction" },
  fertilizer:   { dot: "bg-emerald-400", label: "Fertilizer"   },
  agriculture:  { dot: "bg-yellow-400",  label: "Agriculture"  },
  energy:       { dot: "bg-sky-400",     label: "Energy"       },
};

export interface PakCommoditiesBoardHandle {
  refresh(): Promise<void>;
}

export const PakistanCommoditiesBoard = React.forwardRef<PakCommoditiesBoardHandle>(
  function PakistanCommoditiesBoard(_, ref) {
    const [chartSymbol, setChartSymbol] = React.useState<ChartSymbol>("PK-GOLD-TOLA");
    const [rawChartSymbol, setRawChartSymbol] = React.useState<RawChartSymbol>("PK-COAL");

    const { data: commodities, isLoading, refreshNow } = usePersistentResource<PkCommoditiesData>({
      cacheKey: "public:pk-commodities-v12",
      url: "/api/public/pakistan-commodities",
      refreshInterval: 2 * 60 * 1000,
    });

    const { data: chartData, isLoading: chartLoading, refreshNow: refreshChart } = usePersistentResource<HistoryPoint[]>({
      cacheKey: `public:commodity-history-v4:${chartSymbol}`,
      url: `/api/public/commodity-history?symbol=${chartSymbol}`,
      refreshInterval: 4 * 60 * 60 * 1000,
      keepPreviousData: false,
    });

    const { data: rawMaterials, isLoading: rawLoading, refreshNow: refreshRaw } = usePersistentResource<PkRawMaterialsData>({
      cacheKey: "public:pk-raw-materials-v3",
      url: "/api/public/pakistan-raw-materials",
      refreshInterval: 6 * 60 * 60 * 1000,
    });

    const { data: rawChartData, isLoading: rawChartLoading, refreshNow: refreshRawChart } = usePersistentResource<HistoryPoint[]>({
      cacheKey: `public:commodity-history-v4:${rawChartSymbol}`,
      url: `/api/public/commodity-history?symbol=${rawChartSymbol}`,
      refreshInterval: 4 * 60 * 60 * 1000,
      keepPreviousData: false,
    });

    const { showLoader: showPkChartLoader, beginSwitch: beginPkSwitch } = useChartSwitchLoader(
      chartSymbol,
      chartData,
      chartLoading
    );
    const { showLoader: showRawChartLoader, beginSwitch: beginRawSwitch } = useChartSwitchLoader(
      rawChartSymbol,
      rawChartData,
      rawChartLoading
    );

    React.useImperativeHandle(ref, () => ({
      refresh: () => Promise.all([refreshNow(), refreshChart(), refreshRaw(), refreshRawChart()]).then(() => undefined),
    }), [refreshNow, refreshChart, refreshRaw, refreshRawChart]);

    const statCards = React.useMemo(() => {
      if (!commodities) return [];
      return [
        commodities.gold24?.pricePerTola != null && {
          label: "Gold 24K / Tola",
          value: fmtPKR(commodities.gold24.pricePerTola),
          change: commodities.gold24.changePerTola,
        },
        commodities.silver?.pricePerTola != null && {
          label: "Silver / Tola",
          value: fmtPKR(commodities.silver.pricePerTola),
          change: commodities.silver.changePerTola,
        },
        commodities.copper?.pricePerKg != null && {
          label: "Copper / kg",
          value: fmtPKR(commodities.copper.pricePerKg),
          change: commodities.copper.changePerKg,
        },
        commodities.platinum?.pricePerTola != null && {
          label: "Platinum / Tola",
          value: fmtPKR(commodities.platinum.pricePerTola),
          change: commodities.platinum.changePerTola,
        },
      ].filter(Boolean) as { label: string; value: string; change: number | null }[];
    }, [commodities]);

    const activeOption = PK_CHART_OPTIONS.find((o) => o.symbol === chartSymbol)!;
    const activeRawOption = RAW_CHART_OPTIONS.find((o) => o.symbol === rawChartSymbol)!;

    const selectPkSymbol = (next: ChartSymbol) => {
      if (next === chartSymbol) return;
      beginPkSwitch();
      setChartSymbol(next);
    };
    const selectRawSymbol = (next: RawChartSymbol) => {
      if (next === rawChartSymbol) return;
      beginRawSwitch();
      setRawChartSymbol(next);
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {isLoading && !commodities
            ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)
            : statCards.map((c) => (
                <StatCard
                  key={c.label}
                  label={c.label}
                  value={c.value}
                  sub={c.change != null ? (
                    <span className={c.change > 0 ? "text-gain" : c.change < 0 ? "text-loss" : "text-muted-foreground"}>
                      {c.change > 0 ? "+" : c.change < 0 ? "-" : ""}{fmtPKR(c.change)} today
                    </span>
                  ) : undefined}
                  tone={c.change == null ? "default" : c.change > 0 ? "gain" : c.change < 0 ? "loss" : "default"}
                  accent="amber"
                  icon={c.change != null && c.change >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                />
              ))}
        </div>

        <div className="flex h-[300px] flex-col overflow-hidden rounded-xl border border-border bg-muted/10 p-3">
          <div className="mb-3 flex h-8 shrink-0 gap-1 overflow-x-auto scrollbar-thin">
            {PK_CHART_OPTIONS.map((opt) => (
              <button
                key={opt.symbol}
                type="button"
                onClick={() => selectPkSymbol(opt.symbol)}
                className={
                  "shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors " +
                  (chartSymbol === opt.symbol
                    ? "border-amber-500/40 bg-amber-500/15 text-amber-400"
                    : "border-border bg-muted/40 text-muted-foreground hover:text-foreground")
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1">
            {showPkChartLoader ? (
              <ChartSwitchLoader
                label={`${activeOption.label} chart`}
                accentClassName="border-amber-500/30 border-t-amber-500"
              />
            ) : (
              <PriceLineChart
                key={chartSymbol}
                data={chartData ?? []}
                color="hsl(43 96% 56%)"
                height={180}
                unit={activeOption.unit}
                label={activeOption.label}
                formatPrice={activeOption.fmt}
                defaultDuration="1Y"
              />
            )}
          </div>
        </div>

        {/* Pakistan Raw Material Prices — Markets-style board */}
        <Card>
          <CardHeader className="gap-3">
            <div className="flex items-center gap-3">
              <IconChip accent="amber" variant="gradient"><Boxes /></IconChip>
              <div>
                <CardTitle>Pakistan Market Rates</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Local spot prices — cement, steel, fertilizer &amp; more
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-4 sm:px-2">
            {rawLoading && !rawMaterials ? (
              <div className="space-y-2 px-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : !rawMaterials || rawMaterials.items.length === 0 ? (
              <p className="px-4 text-sm text-muted-foreground">Prices unavailable</p>
            ) : (
              <>
                {/* Mobile cards — same layout as Markets mobile rows */}
                <div className="space-y-3 px-3 sm:hidden">
                  {rawMaterials.items.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-border bg-card p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{item.label}</p>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {item.unit}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          {item.price != null ? (
                            <p className="font-semibold tabular-nums">
                              Rs {item.price.toLocaleString("en-PK")}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">—</p>
                          )}
                          <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                            {CATEGORY_STYLES[item.category]?.label ?? item.category}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop table — same columns pattern as Markets */}
                <div className="hidden overflow-x-auto scrollbar-thin sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Market</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rawMaterials.items.map((item) => (
                        <TableRow key={item.label}>
                          <TableCell>
                            <div>
                              <p className="font-semibold">{item.label}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {item.unit}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize text-muted-foreground">
                            {CATEGORY_STYLES[item.category]?.label ?? item.category}
                          </TableCell>
                          <TableCell className="text-right font-semibold tabular-nums">
                            {item.price != null
                              ? `Rs ${item.price.toLocaleString("en-PK")}`
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
            {rawMaterials && (
              <p className="mt-3 px-4 text-xs text-muted-foreground sm:px-2">
                Sources: {rawMaterials.source}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Raw Material Price Charts */}
        <div className="rounded-xl border border-border bg-muted/10 p-3">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Raw Material Price History
          </p>
          <div className="mb-3 flex flex-wrap gap-1">
            {RAW_CHART_OPTIONS.map((opt) => (
              <button
                key={opt.symbol}
                type="button"
                onClick={() => selectRawSymbol(opt.symbol)}
                className={
                  "rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors " +
                  (rawChartSymbol === opt.symbol
                    ? "border-orange-500/40 bg-orange-500/15 text-orange-400"
                    : "border-border bg-muted/40 text-muted-foreground hover:text-foreground")
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
          {showRawChartLoader ? (
            <ChartSwitchLoader
              label={`${activeRawOption.label} chart`}
              accentClassName="border-orange-500/30 border-t-orange-500"
              className="h-40"
            />
          ) : !rawChartData || rawChartData.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">No historical data available</p>
          ) : (
            <PriceLineChart
              key={rawChartSymbol}
              data={rawChartData}
              color="hsl(25 95% 53%)"
              height={160}
              unit={activeRawOption.unit}
              label={activeRawOption.label}
              formatPrice={activeRawOption.fmt}
              defaultDuration="1Y"
            />
          )}
          <p className="mt-2 text-[10px] text-muted-foreground/60">
            {rawChartSymbol === "PK-CEMENT-V3"
              ? "Pakistan cement sector trend — scaled to current local price"
              : "International benchmark × PKR rate, calibrated to current local price"}
          </p>
        </div>
      </div>
    );
  }
);

function fmtPKR(n: number) {
  return "Rs " + Math.abs(n).toLocaleString("en-PK", { maximumFractionDigits: 0 });
}
