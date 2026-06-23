"use client";

import * as React from "react";
import { Maximize2, PieChart, Wallet, TrendingUp, CalendarClock, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AllocationChart } from "@/components/charts/allocation-chart";
import { HoldingsTable } from "@/components/holdings-table";
import { useLiveHoldings } from "@/lib/hooks/use-live-holdings";
import { allocationBySector, computeSummary } from "@/lib/services/metrics";
import { formatPKR, formatPercent, plColorClass } from "@/lib/format";
import type { HoldingWithMetrics, Portfolio } from "@/lib/types";

type PortfolioOption = Pick<Portfolio, "id" | "name">;
type AllocationMode = "sector" | "holding";

export function AllocationExplorer({
  holdings,
  portfolios,
  defaultPortfolioId = "all",
  defaultMode = "sector",
  title = "Allocation",
  description = "Explore exposure, invested amount and live P/L by portfolio.",
  className,
}: {
  holdings: HoldingWithMetrics[];
  portfolios: PortfolioOption[];
  defaultPortfolioId?: string;
  defaultMode?: AllocationMode;
  title?: string;
  description?: string;
  className?: string;
}) {
  const [portfolioId, setPortfolioId] = React.useState(defaultPortfolioId);
  const [mode, setMode] = React.useState<AllocationMode>(defaultMode);
  const { liveHoldings } = useLiveHoldings(holdings);
  const portfolioNames = React.useMemo(
    () => Object.fromEntries(portfolios.map((p) => [p.id, p.name])),
    [portfolios]
  );

  const filtered = React.useMemo(
    () =>
      portfolioId === "all"
        ? liveHoldings
        : liveHoldings.filter((h) => h.portfolio_id === portfolioId),
    [liveHoldings, portfolioId]
  );
  const summary = React.useMemo(() => computeSummary(filtered), [filtered]);
  const sectorData = React.useMemo(() => allocationBySector(filtered), [filtered]);
  const holdingData = React.useMemo(() => allocationByHoldingName(filtered), [filtered]);
  const chartData = mode === "sector" ? sectorData : holdingData;
  const selectedName =
    portfolioId === "all" ? "All portfolios" : portfolioNames[portfolioId] ?? "Portfolio";

  return (
    <Card className={className}>
      <CardHeader className="flex-row items-start justify-between gap-2">
        <div className="min-w-0">
          <CardTitle>{title}</CardTitle>
          <p className="mt-1 truncate text-sm text-muted-foreground">{selectedName}</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Expand allocation">
              <Maximize2 className="size-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[92vh] w-[calc(100vw-1.5rem)] overflow-y-auto p-4 sm:max-w-6xl sm:p-6">
            <DialogHeader>
              <DialogTitle>Portfolio allocation</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              <AllocationControls
                portfolioId={portfolioId}
                setPortfolioId={setPortfolioId}
                portfolios={portfolios}
                mode={mode}
                setMode={setMode}
              />

              <SummaryGrid summary={summary} />

              <div className="rounded-xl border border-border p-4">
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <PieChart className="size-4 text-primary" />
                    <p className="font-semibold">
                      {mode === "sector" ? "Sector allocation" : "Holding allocation"}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedName}</p>
                </div>
                <div className="mx-auto max-w-5xl">
                  <AllocationChart
                    data={chartData}
                    maxSlices={mode === "holding" ? Math.max(12, chartData.length) : 8}
                    showSliceLabels={mode === "holding"}
                    variant="expanded"
                    legendVariant={mode === "holding" ? "holdingPairs" : "default"}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div>
                    <p className="font-semibold">Holdings</p>
                    <p className="text-xs text-muted-foreground">
                      {filtered.length} position{filtered.length === 1 ? "" : "s"} in {selectedName}
                    </p>
                  </div>
                </div>
                <HoldingsTable
                  holdings={filtered}
                  showPortfolio={portfolioId === "all"}
                  portfolioNames={portfolioNames}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={mode} onValueChange={(v) => setMode(v as AllocationMode)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sector">Sectors</TabsTrigger>
            <TabsTrigger value="holding">Holdings</TabsTrigger>
          </TabsList>
          <TabsContent value="sector" className="mt-4">
            <AllocationChart data={sectorData} maxSlices={8} />
          </TabsContent>
          <TabsContent value="holding" className="mt-4">
            <AllocationChart
              data={holdingData}
              maxSlices={Math.max(12, holdingData.length)}
              showSliceLabels
              legendVariant="holdingPairs"
            />
          </TabsContent>
        </Tabs>
        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <MiniStat label="Invested" value={formatPKR(summary.totalInvested)} />
          <MiniStat
            label="Total P/L"
            value={formatPKR(summary.totalPL, { sign: true })}
            className={plColorClass(summary.totalPL)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function AllocationControls({
  portfolioId,
  setPortfolioId,
  portfolios,
  mode,
  setMode,
}: {
  portfolioId: string;
  setPortfolioId: (id: string) => void;
  portfolios: PortfolioOption[];
  mode: AllocationMode;
  setMode: (mode: AllocationMode) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Select value={portfolioId} onValueChange={setPortfolioId}>
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue placeholder="Select portfolio" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All portfolios</SelectItem>
          {portfolios.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Tabs value={mode} onValueChange={(v) => setMode(v as AllocationMode)} className="w-full sm:w-auto">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto">
          <TabsTrigger value="sector">By sector</TabsTrigger>
          <TabsTrigger value="holding">By holding</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

function allocationByHoldingName(holdings: HoldingWithMetrics[]) {
  const total = holdings.reduce((sum, h) => sum + h.marketValue, 0);
  return holdings
    .map((h) => {
      return {
        label: h.symbol,
        value: h.marketValue,
        pct: total ? (h.marketValue / total) * 100 : 0,
      };
    })
    .sort((a, b) => b.value - a.value);
}

function SummaryGrid({ summary }: { summary: ReturnType<typeof computeSummary> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard icon={<Wallet className="size-4" />} label="Market value" value={formatPKR(summary.totalValue)} />
      <SummaryCard icon={<Coins className="size-4" />} label="Invested" value={formatPKR(summary.totalInvested)} />
      <SummaryCard
        icon={<TrendingUp className="size-4" />}
        label="Total P/L"
        value={formatPKR(summary.totalPL, { sign: true })}
        sub={formatPercent(summary.totalPLPct)}
        tone={summary.totalPL}
      />
      <SummaryCard
        icon={<CalendarClock className="size-4" />}
        label="Day P/L"
        value={formatPKR(summary.dayPL, { sign: true })}
        sub={formatPercent(summary.dayPLPct)}
        tone={summary.dayPL}
      />
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone?: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className={`mt-2 text-lg font-semibold tabular-nums ${tone == null ? "" : plColorClass(tone)}`}>
        {value}
      </p>
      {sub && <p className={`text-xs tabular-nums ${plColorClass(tone)}`}>{sub}</p>}
    </div>
  );
}

function MiniStat({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-semibold tabular-nums ${className ?? ""}`}>{value}</p>
    </div>
  );
}
