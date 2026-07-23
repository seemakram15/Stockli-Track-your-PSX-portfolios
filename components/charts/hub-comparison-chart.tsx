"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronsUpDown, Expand, Minimize2 } from "lucide-react";
import { formatPercent, plColorClass } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type HubSeriesInput = {
  key: string;
  name: string;
  color: string;
  kind: "benchmark" | "portfolio";
  /** Absolute levels (index points or portfolio value units). */
  levels: Array<{ date: string; value: number }>;
};

type BucketKind = "day" | "week" | "month" | "semi" | "year";

/**
 * Calendar lookbacks match PSX DPS methodology (close on/before N days ago → latest).
 * Chart grain is independent of the total-return window.
 */
const RANGES = [
  { label: "1D", lookbackDays: 1, bucket: "day" as BucketKind, maxPoints: 1, hint: "1-day return" },
  { label: "7D", lookbackDays: 7, bucket: "day" as BucketKind, maxPoints: 7, hint: "Daily returns · last 7 sessions" },
  { label: "1M", lookbackDays: 30, bucket: "day" as BucketKind, maxPoints: 25, hint: "Daily returns · ~1 month" },
  { label: "3M", lookbackDays: 91, bucket: "week" as BucketKind, maxPoints: 14, hint: "Weekly returns · ~3 months" },
  { label: "6M", lookbackDays: 182, bucket: "month" as BucketKind, maxPoints: 6, hint: "Monthly returns · ~6 months" },
  { label: "1Y", lookbackDays: 365, bucket: "month" as BucketKind, maxPoints: 12, hint: "Monthly returns · 1 year" },
  { label: "2Y", lookbackDays: 730, bucket: "semi" as BucketKind, maxPoints: 4, hint: "6-month returns · 2 years" },
  { label: "All", lookbackDays: 365 * 5, bucket: "year" as BucketKind, maxPoints: 5, hint: "Yearly returns · last 5 years" },
] as const;

type RangeLabel = (typeof RANGES)[number]["label"];
type RangeConfig = (typeof RANGES)[number];

type ChartRow = {
  key: string;
  label: string;
  /** Richer date shown in tooltip (e.g. week range). Falls back to label. */
  hoverLabel?: string;
  [seriesKey: string]: string | number | null | undefined;
};

type TotalReturnRow = {
  key: string;
  name: string;
  color: string;
  kind: "benchmark" | "portfolio";
  totalReturn: number | null;
};

export function HubComparisonChart({
  series,
  height = 280,
  className,
  dialogTitle = "Portfolios vs indexes",
  dialogDescription = "Period returns vs KSE100, KMI30 and KSE30 — totals use PSX calendar lookbacks",
  benchmarkPicker = false,
}: {
  series: HubSeriesInput[];
  height?: number;
  className?: string;
  dialogTitle?: string;
  dialogDescription?: string;
  /** When true, indexes are chosen via a multi-select dropdown on the graph. */
  benchmarkPicker?: boolean;
}) {
  const [mounted, setMounted] = React.useState(false);
  const [range, setRange] = React.useState<RangeLabel>("1M");
  const [hidden, setHidden] = React.useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = React.useState(false);
  const [expandedHeight, setExpandedHeight] = React.useState(560);

  const benchmarks = React.useMemo(
    () => series.filter((item) => item.kind === "benchmark"),
    [series]
  );

  const [selectedBenchmarks, setSelectedBenchmarks] = React.useState<string[]>([]);
  React.useEffect(() => {
    if (!benchmarkPicker) return;
    setSelectedBenchmarks((prev) => {
      const keys = benchmarks.map((item) => item.key);
      if (!keys.length) return [];
      if (!prev.length) return keys;
      const kept = prev.filter((key) => keys.includes(key));
      return kept.length ? kept : keys;
    });
  }, [benchmarkPicker, benchmarks]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!expanded) return;
    function syncHeight() {
      setExpandedHeight(Math.max(360, Math.min(window.innerHeight - 200, 780)));
    }
    syncHeight();
    window.addEventListener("resize", syncHeight);
    return () => window.removeEventListener("resize", syncHeight);
  }, [expanded]);

  const rangeConfig = RANGES.find((item) => item.label === range) ?? RANGES[1];

  const { rows, totals, periodHint } = React.useMemo(
    () => buildRangeView(series, rangeConfig),
    [series, rangeConfig]
  );

  const effectiveHidden = React.useMemo(() => {
    if (!benchmarkPicker) return hidden;
    const next: Record<string, boolean> = {};
    for (const item of benchmarks) {
      next[item.key] = !selectedBenchmarks.includes(item.key);
    }
    return next;
  }, [benchmarkPicker, hidden, benchmarks, selectedBenchmarks]);

  const visibleSeries = series.filter((item) => !effectiveHidden[item.key]);
  const displayTotals = benchmarkPicker
    ? totals.filter((item) => !effectiveHidden[item.key])
    : totals;

  if (!series.some((item) => item.levels.length > 1)) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 text-sm text-muted-foreground",
          className
        )}
        style={{ minHeight: height }}
      >
        Trend data will appear once history loads
      </div>
    );
  }

  if (!mounted) {
    return <div className={cn("rounded-2xl bg-muted/15", className)} style={{ minHeight: height }} />;
  }

  const bodyProps = {
    range,
    rangeConfig,
    rows,
    totals: displayTotals,
    periodHint,
    visibleSeries,
    hidden: effectiveHidden,
    benchmarkPicker,
    benchmarks,
    selectedBenchmarks,
    onRangeChange: setRange,
    onToggleSeries: (key: string) => {
      if (benchmarkPicker) {
        const seriesItem = series.find((item) => item.key === key);
        if (seriesItem?.kind === "benchmark") {
          setSelectedBenchmarks((prev) =>
            prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
          );
        }
        return;
      }
      setHidden((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    onBenchmarkCheckedChange: (key: string, checked: boolean) => {
      setSelectedBenchmarks((prev) => {
        if (checked) return prev.includes(key) ? prev : [...prev, key];
        return prev.filter((item) => item !== key);
      });
    },
    onExpandToggle: () => setExpanded((open) => !open),
    expandLabel: expanded ? "Collapse chart" : "Expand chart",
  };

  return (
    <div className={cn("space-y-3", className)}>
      <ChartBody {...bodyProps} height={height} />

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent
          showCloseButton
          className="flex h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-7xl flex-col gap-3 overflow-hidden overscroll-contain p-3 pt-10 sm:max-w-[min(1200px,calc(100%-2rem))] sm:p-4 sm:pt-10"
        >
          <DialogHeader className="shrink-0 space-y-1 pr-8 text-left">
            <DialogTitle className="text-base">{dialogTitle}</DialogTitle>
            <DialogDescription className="text-xs">{dialogDescription}</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ChartBody {...bodyProps} height={expandedHeight} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ChartBody({
  range,
  rangeConfig,
  rows,
  totals,
  periodHint,
  visibleSeries,
  hidden,
  height,
  benchmarkPicker = false,
  benchmarks = [],
  selectedBenchmarks = [],
  onRangeChange,
  onToggleSeries,
  onBenchmarkCheckedChange,
  onExpandToggle,
  expandLabel,
}: {
  range: RangeLabel;
  rangeConfig: RangeConfig;
  rows: ChartRow[];
  totals: TotalReturnRow[];
  periodHint: string;
  visibleSeries: HubSeriesInput[];
  hidden: Record<string, boolean>;
  height: number;
  benchmarkPicker?: boolean;
  benchmarks?: HubSeriesInput[];
  selectedBenchmarks?: string[];
  onRangeChange: (range: RangeLabel) => void;
  onToggleSeries: (key: string) => void;
  onBenchmarkCheckedChange?: (key: string, checked: boolean) => void;
  onExpandToggle: () => void;
  expandLabel: string;
}) {
  const useBars = range === "1D" || rows.length <= 1;
  const collapsed = expandLabel === "Expand chart";
  const selectedCount = selectedBenchmarks.length;
  const compareLabel =
    selectedCount === 0
      ? "Compare vs indexes"
      : selectedCount === 1
        ? `vs ${benchmarks.find((item) => item.key === selectedBenchmarks[0])?.name ?? "index"}`
        : `vs ${selectedCount} indexes`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{rangeConfig.hint}</p>
        <div className="flex flex-wrap gap-0.5 rounded-xl border border-border/70 bg-muted/80 p-1">
          {RANGES.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onRangeChange(item.label)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition",
                range === item.label
                  ? "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
        {totals.map((item) => {
          const off = Boolean(hidden[item.key]);
          const locked = benchmarkPicker && item.kind === "portfolio";
          return (
            <button
              key={item.key}
              type="button"
              disabled={locked}
              onClick={() => onToggleSeries(item.key)}
              className={cn(
                "rounded-xl border px-2.5 py-2 text-left transition",
                off
                  ? "border-border/50 bg-muted/10 opacity-50"
                  : "border-border/70 bg-background/80 hover:border-primary/30",
                locked && "cursor-default hover:border-border/70"
              )}
            >
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <span className="size-2 rounded-full" style={{ background: item.color }} />
                <span className="truncate">{item.name}</span>
              </p>
              <p
                className={cn(
                  "mt-1 text-sm font-bold tabular-nums",
                  item.totalReturn == null ? "text-muted-foreground" : plColorClass(item.totalReturn)
                )}
              >
                {item.totalReturn == null ? "—" : formatPercent(item.totalReturn)}
              </p>
              <p className="text-[10px] text-muted-foreground">{range} total</p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-muted-foreground">
        <span>{periodHint}</span>
        <span className="text-border">·</span>
        <span>
          {benchmarkPicker
            ? "Use Compare on the graph to pick indexes"
            : "Tap a total card to show/hide its line"}
        </span>
      </div>

      <div className="relative">
        {benchmarkPicker && benchmarks.length > 0 ? (
          <div className="absolute right-1 top-1 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 border-border/50 bg-transparent px-2.5 text-xs text-foreground shadow-none backdrop-blur-[2px] hover:bg-background/40"
                >
                  {compareLabel}
                  <ChevronsUpDown className="size-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Compare against</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {benchmarks.map((item) => (
                  <DropdownMenuCheckboxItem
                    key={item.key}
                    checked={selectedBenchmarks.includes(item.key)}
                    onCheckedChange={(checked) =>
                      onBenchmarkCheckedChange?.(item.key, Boolean(checked))
                    }
                    onSelect={(event) => event.preventDefault()}
                  >
                    <span className="mr-2 size-2 rounded-full" style={{ background: item.color }} />
                    {item.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="absolute bottom-1 right-1 z-10 size-8 border-border/50 bg-transparent shadow-none backdrop-blur-[2px] hover:bg-background/40"
          onClick={onExpandToggle}
          title={expandLabel}
          aria-label={expandLabel}
        >
          {collapsed ? <Expand className="size-4" /> : <Minimize2 className="size-4" />}
        </Button>

        {rows.length === 0 || visibleSeries.length === 0 ? (
          <div
            className="flex items-center justify-center rounded-2xl border border-dashed border-border/70 text-sm text-muted-foreground"
            style={{ height }}
          >
            No return points in this range
          </div>
        ) : useBars ? (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={rows}
              margin={{
                top: benchmarkPicker ? 36 : 8,
                right: 8,
                left: 0,
                bottom: 28,
              }}
            >
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value) => formatPercent(Number(value), 0)}
                width={48}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeOpacity={0.3} />
              <Tooltip content={<HubTooltip series={visibleSeries} />} />
              {visibleSeries.map((item) => (
                <Bar
                  key={item.key}
                  dataKey={item.key}
                  name={item.name}
                  fill={item.color}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart
              data={rows}
              margin={{
                top: benchmarkPicker ? 36 : 8,
                right: 8,
                left: 0,
                bottom: 28,
              }}
            >
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                minTickGap={28}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value) => formatPercent(Number(value), 0)}
                width={48}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                domain={["auto", "auto"]}
              />
              <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeOpacity={0.3} />
              <Tooltip content={<HubTooltip series={visibleSeries} />} />
              {visibleSeries.map((item) => (
                <Line
                  key={item.key}
                  type="monotone"
                  dataKey={item.key}
                  name={item.name}
                  stroke={item.color}
                  strokeWidth={item.kind === "portfolio" ? 2.4 : 1.8}
                  strokeDasharray={item.kind === "benchmark" ? "5 4" : undefined}
                  isAnimationActive={false}
                  dot={rows.length <= 8 ? { r: 3, strokeWidth: 1.5 } : false}
                  activeDot={{ r: 4 }}
                  connectNulls
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function HubTooltip({
  active,
  payload,
  label,
  series,
}: {
  active?: boolean;
  payload?: Array<{
    dataKey?: string | number;
    value?: number | string;
    color?: string;
    name?: string;
    payload?: ChartRow;
  }>;
  label?: string;
  series: HubSeriesInput[];
}) {
  if (!active || !payload?.length) return null;
  const allowed = new Set(series.map((item) => item.key));
  const seen = new Set<string>();
  const rows = payload.filter((item) => {
    if (typeof item.dataKey !== "string" || !allowed.has(item.dataKey)) return false;
    if (typeof item.value !== "number") return false;
    if (seen.has(item.dataKey)) return false;
    seen.add(item.dataKey);
    return true;
  });
  if (!rows.length) return null;

  const point = payload[0]?.payload;
  const title =
    (typeof point?.hoverLabel === "string" && point.hoverLabel) ||
    (typeof point?.label === "string" && point.label) ||
    label;

  return (
    <div className="min-w-52 rounded-xl border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="mb-2 font-medium">{title}</p>
      <div className="space-y-1.5">
        {rows.map((row) => {
          const value = Number(row.value);
          return (
            <div key={String(row.dataKey)} className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full" style={{ background: row.color }} />
                {row.name}
              </span>
              <span className={cn("font-semibold tabular-nums", plColorClass(value))}>
                {formatPercent(value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function buildRangeView(
  series: HubSeriesInput[],
  range: RangeConfig
): { rows: ChartRow[]; totals: TotalReturnRow[]; periodHint: string } {
  const lastDate = latestSharedDate(series);
  if (!lastDate) {
    return { rows: [], totals: [], periodHint: "Period returns" };
  }

  const totals: TotalReturnRow[] = series.map((item) => ({
    key: item.key,
    name: item.name,
    color: item.color,
    kind: item.kind,
    totalReturn: calendarTotalReturn(item.levels, lastDate, range),
  }));

  const windowed = series.map((item) => ({
    ...item,
    levels: sliceLevelsForChart(item.levels, range, lastDate),
  }));

  const buckets = buildBuckets(windowed, range, lastDate);
  let previousAxisMonth = "";
  const rows: ChartRow[] = buckets.map((bucket) => {
    let axisLabel = bucket.label;
    if (range.bucket === "week") {
      const month = formatMonthShort(bucket.end);
      // X-axis: month name only when the month changes (avoid W18 / W19).
      axisLabel = month !== previousAxisMonth ? month : "";
      previousAxisMonth = month;
    }

    const row: ChartRow = {
      key: bucket.key,
      label: axisLabel,
      hoverLabel: bucket.hoverLabel ?? bucket.label,
    };
    for (const item of windowed) {
      row[item.key] = periodReturnInBucket(item.levels, bucket.start, bucket.end);
    }
    return row;
  });

  const periodHint =
    range.bucket === "day"
      ? "Chart: session return %"
      : range.bucket === "week"
        ? "Chart: weekly return %"
        : range.bucket === "month"
          ? "Chart: monthly return %"
          : range.bucket === "semi"
            ? "Chart: 6-month return %"
            : "Chart: yearly return %";

  return { rows, totals, periodHint };
}

/** PSX-style total: latest close vs close on/before (lastDate − N calendar days). */
function calendarTotalReturn(
  levels: Array<{ date: string; value: number }>,
  lastDate: string,
  range: RangeConfig
) {
  const upto = levels.filter((point) => point.date <= lastDate);
  if (upto.length < 2) return null;

  const end = upto[upto.length - 1];
  if (!end || end.value === 0) return null;

  // 1D: previous trading session (not calendar yesterday — weekends/holidays).
  if (range.label === "1D") {
    const prior = upto[upto.length - 2];
    if (!prior || prior.value === 0) return null;
    return round2(((end.value - prior.value) / prior.value) * 100);
  }

  const target = shiftDate(lastDate, -range.lookbackDays);
  const base = [...upto].reverse().find((point) => point.date <= target) ?? upto[0];
  if (!base || base.value === 0) return null;
  return round2(((end.value - base.value) / base.value) * 100);
}

function sliceLevelsForChart(
  levels: Array<{ date: string; value: number }>,
  range: RangeConfig,
  lastDate: string
) {
  const upto = levels.filter((point) => point.date <= lastDate);
  if (upto.length === 0) return [];

  if (range.label === "1D") return upto.slice(-2);
  if (range.label === "7D") {
    // Need prior close for the first of 7 sessions.
    return upto.slice(-8);
  }

  const cutoff = shiftDate(lastDate, -range.lookbackDays);
  const firstIdx = upto.findIndex((point) => point.date >= cutoff);
  if (firstIdx < 0) return upto.slice(-2);
  // Keep one prior point so the first period bucket has a correct start basis.
  return upto.slice(Math.max(0, firstIdx - 1));
}

function buildBuckets(series: HubSeriesInput[], range: RangeConfig, lastDate: string) {
  const dates = Array.from(
    new Set(series.flatMap((item) => item.levels.map((point) => point.date)))
  )
    .filter((date) => date <= lastDate)
    .sort();

  if (dates.length === 0) {
    return [] as Array<{ key: string; label: string; hoverLabel: string; start: string; end: string }>;
  }

  const { bucket, maxPoints, lookbackDays, label: rangeLabel } = range;

  if (bucket === "day") {
    let eligible = dates;
    if (rangeLabel === "1D") {
      eligible = dates.slice(-1);
    } else if (rangeLabel === "7D") {
      eligible = dates.slice(-maxPoints);
    } else {
      // Drop the padded prior-close day used only for return math.
      const cutoff = shiftDate(lastDate, -lookbackDays);
      eligible = dates.filter((date) => date >= cutoff).slice(-maxPoints);
    }
    return eligible.map((date) => ({
      key: date,
      label: formatDayLabel(date),
      hoverLabel: formatDayLabel(date),
      start: date,
      end: date,
    }));
  }

  const groups = new Map<
    string,
    { key: string; label: string; hoverLabel: string; start: string; end: string }
  >();
  for (const date of dates) {
    // Skip padded prior for non-day buckets when it falls before the window.
    if (rangeLabel !== "1D" && rangeLabel !== "7D") {
      const cutoff = shiftDate(lastDate, -lookbackDays);
      if (date < cutoff) continue;
    }
    const meta = bucketMeta(date, bucket);
    const existing = groups.get(meta.key);
    if (!existing) {
      groups.set(meta.key, { ...meta, start: date, end: date });
    } else {
      existing.end = date;
    }
  }

  return Array.from(groups.values())
    .slice(-maxPoints)
    .map((group) => ({
      ...group,
      hoverLabel:
        bucket === "week" ? formatWeekRange(group.start, group.end) : group.hoverLabel || group.label,
    }));
}

function bucketMeta(date: string, bucket: BucketKind) {
  const [year, month] = date.split("-").map(Number);
  if (bucket === "week") {
    const week = isoWeek(date);
    return {
      key: `${week.year}-W${String(week.week).padStart(2, "0")}`,
      label: formatMonthShort(date),
      hoverLabel: formatDayLabel(date),
    };
  }
  if (bucket === "month") {
    return {
      key: `${year}-${String(month).padStart(2, "0")}`,
      label: formatMonthLabel(date),
      hoverLabel: formatMonthLabel(date),
    };
  }
  if (bucket === "semi") {
    const half = month <= 6 ? "H1" : "H2";
    return {
      key: `${year}-${half}`,
      label: `${year} ${half}`,
      hoverLabel: `${year} ${half}`,
    };
  }
  return {
    key: String(year),
    label: String(year),
    hoverLabel: String(year),
  };
}

function periodReturnInBucket(
  levels: Array<{ date: string; value: number }>,
  start: string,
  end: string
) {
  const inBucket = levels.filter((point) => point.date >= start && point.date <= end);
  if (inBucket.length === 0) return null;

  const prior = [...levels].reverse().find((point) => point.date < start);
  const startValue = prior?.value ?? inBucket[0]?.value;
  const endValue = inBucket[inBucket.length - 1]?.value;
  if (startValue == null || endValue == null || startValue === 0) return null;
  return round2(((endValue - startValue) / startValue) * 100);
}

function latestSharedDate(series: HubSeriesInput[]) {
  let latest = "";
  for (const item of series) {
    const date = item.levels[item.levels.length - 1]?.date;
    if (date && date > latest) latest = date;
  }
  return latest || null;
}

function shiftDate(isoDate: string, deltaDays: number) {
  const date = new Date(`${isoDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + deltaDays);
  return date.toISOString().slice(0, 10);
}

function formatDayLabel(date: string) {
  try {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-PK", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return date;
  }
}

function formatMonthLabel(date: string) {
  try {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-PK", {
      month: "short",
      year: "2-digit",
    });
  } catch {
    return date.slice(0, 7);
  }
}

function formatMonthShort(date: string) {
  try {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-PK", { month: "short" });
  } catch {
    return date.slice(5, 7);
  }
}

function formatWeekRange(start: string, end: string) {
  try {
    const startLabel = new Date(`${start}T00:00:00`).toLocaleDateString("en-PK", {
      month: "short",
      day: "numeric",
    });
    const endLabel = new Date(`${end}T00:00:00`).toLocaleDateString("en-PK", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    if (start === end) return endLabel;
    return `${startLabel} – ${endLabel}`;
  } catch {
    return start === end ? start : `${start} – ${end}`;
  }
}

function isoWeek(date: string) {
  const d = new Date(`${date}T12:00:00Z`);
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
