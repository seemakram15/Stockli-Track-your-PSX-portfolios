"use client";

import * as React from "react";
import { ChartCandlestick, ChartLine, Expand, Minimize2 } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Candle, SeriesPoint } from "@/lib/types";

type ChartType = "candles" | "area";
type Range =
  | "1H"
  | "3H"
  | "1D"
  | "1M"
  | "3M"
  | "6M"
  | "1Y"
  | "5Y"
  | "10Y"
  | "ALL";

const INTRADAY_RANGES = new Set<Range>(["1H", "3H", "1D"]);
const RANGES: Range[] = ["1H", "3H", "1D", "1M", "3M", "6M", "1Y", "5Y", "10Y", "ALL"];

/** Calendar-day lookbacks for EOD range windows. */
const RANGE_CALENDAR_DAYS: Record<Exclude<Range, "1H" | "3H" | "1D" | "ALL">, number> = {
  "1M": 31,
  "3M": 93,
  "6M": 186,
  "1Y": 366,
  "5Y": 365 * 5 + 2,
  "10Y": 365 * 10 + 3,
};

const INTRADAY_HOURS: Record<"1H" | "3H" | "1D", number | null> = {
  "1H": 1,
  "3H": 3,
  "1D": null,
};

function sanitizeCandles(candles: Candle[]): Candle[] {
  const byDay = new Map<number, Candle>();
  for (const c of candles) {
    const d = new Date(c.time * 1000);
    const day = Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 1000);
    byDay.set(day, { ...c, time: day });
  }
  return [...byDay.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, c]) => c);
}

function toBusinessDay(ts: number): { year: number; month: number; day: number } {
  const d = new Date(ts * 1000);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

/** Build OHLC candles from tick/line points for intraday TradingView mode. */
function aggregateToCandles(points: SeriesPoint[], bucketSec: number): Candle[] {
  if (!points.length) return [];
  const buckets = new Map<number, Candle>();
  for (const p of points) {
    const t = Math.floor(p.time / bucketSec) * bucketSec;
    const vol = p.volume ?? 0;
    const existing = buckets.get(t);
    if (!existing) {
      buckets.set(t, {
        time: t,
        open: p.value,
        high: p.value,
        low: p.value,
        close: p.value,
        volume: vol > 0 ? vol : undefined,
      });
    } else {
      existing.high = Math.max(existing.high, p.value);
      existing.low = Math.min(existing.low, p.value);
      existing.close = p.value;
      if (vol > 0) existing.volume = (existing.volume ?? 0) + vol;
    }
  }
  return [...buckets.values()].sort((a, b) => a.time - b.time);
}

/** How many bars from the end should be visible for a range. */
function visibleBarCount(series: { time: number }[], range: Range): number {
  if (!series.length) return 0;
  if (range === "ALL") return series.length;

  if (INTRADAY_RANGES.has(range)) {
    const hours = INTRADAY_HOURS[range as "1H" | "3H" | "1D"];
    if (hours == null) return series.length;
    const cutoff = series[series.length - 1].time - hours * 3600;
    return Math.max(
      2,
      series.reduce((n, p) => n + (p.time >= cutoff ? 1 : 0), 0)
    );
  }

  const days = RANGE_CALENDAR_DAYS[range as Exclude<Range, "1H" | "3H" | "1D" | "ALL">];
  const cutoff = series[series.length - 1].time - days * 86_400;
  return Math.max(
    2,
    series.reduce((n, p) => n + (p.time >= cutoff ? 1 : 0), 0)
  );
}

function applyRangeWindow(
  setVisibleLogicalRange: (range: { from: number; to: number }) => void,
  barCount: number,
  range: Range,
  seriesLength: number
) {
  if (seriesLength < 2) return;
  if (range === "ALL" || barCount >= seriesLength) {
    setVisibleLogicalRange({ from: -0.5, to: seriesLength - 0.5 });
    return;
  }
  const count = Math.min(seriesLength, Math.max(barCount, 8));
  setVisibleLogicalRange({
    from: seriesLength - count - 0.5,
    to: seriesLength - 0.5,
  });
}

/** Infer the closest range chip from the currently visible time span. */
function inferRangeFromVisible(
  series: { time: number }[],
  from: number,
  to: number,
  isIntraday: boolean
): Range | null {
  if (series.length < 2) return null;
  const i0 = Math.max(0, Math.min(series.length - 1, Math.floor(from)));
  const i1 = Math.max(0, Math.min(series.length - 1, Math.ceil(to)));
  if (i1 <= i0) return null;
  const spanSec = Math.max(1, series[i1].time - series[i0].time);

  if (isIntraday) {
    const hours = spanSec / 3600;
    if (hours <= 1.35) return "1H";
    if (hours <= 4) return "3H";
    return "1D";
  }

  const days = spanSec / 86_400;
  if (days <= 40) return "1M";
  if (days <= 120) return "3M";
  if (days <= 220) return "6M";
  if (days <= 420) return "1Y";
  if (days <= 365 * 6) return "5Y";
  if (days <= 365 * 12) return "10Y";
  return "ALL";
}

function palette(dark: boolean) {
  return dark
    ? {
        up: "#34d8a0",
        down: "#ff6f6f",
        text: "#cfd6e2",
        grid: "rgba(255,255,255,0.05)",
        border: "rgba(255,255,255,0.10)",
        areaTop: "rgba(52,216,160,0.30)",
        areaBottom: "rgba(52,216,160,0.0)",
        line: "#34d8a0",
        volumeUp: "rgba(52,216,160,0.45)",
        volumeDown: "rgba(255,111,111,0.45)",
      }
    : {
        up: "#0f9d6b",
        down: "#d64545",
        text: "#46506180",
        grid: "rgba(0,0,0,0.05)",
        border: "rgba(0,0,0,0.10)",
        areaTop: "rgba(15,157,107,0.25)",
        areaBottom: "rgba(15,157,107,0.0)",
        line: "#0f9d6b",
        volumeUp: "rgba(15,157,107,0.35)",
        volumeDown: "rgba(214,69,69,0.35)",
      };
}

function useChartSeries(candles: Candle[], intraday: SeriesPoint[] | undefined, range: Range) {
  const hasIntraday = (intraday?.length ?? 0) > 1;
  const isIntradayRange = INTRADAY_RANGES.has(range);

  // Always keep the FULL series so zooming out can reveal longer history.
  const eodAll = React.useMemo(() => sanitizeCandles(candles), [candles]);

  const intradayCandles = React.useMemo(() => {
    if (!hasIntraday) return [] as Candle[];
    // 1-min buckets for short windows; denser history still available when zooming out to 1D.
    const bucket = range === "1D" ? 5 * 60 : 60;
    return aggregateToCandles(intraday!, bucket);
  }, [hasIntraday, intraday, range]);

  const intradayArea = React.useMemo(() => {
    if (!hasIntraday) return [] as SeriesPoint[];
    return [...intraday!].sort((a, b) => a.time - b.time);
  }, [hasIntraday, intraday]);

  return { hasIntraday, isIntradayRange, eodAll, intradayCandles, intradayArea };
}

function ChartCanvas({
  type,
  range,
  height,
  showVolume,
  eodAll,
  intradayCandles,
  intradayArea,
  isIntradayRange,
  onRangeInfer,
}: {
  type: ChartType;
  range: Range;
  height: number;
  showVolume: boolean;
  eodAll: Candle[];
  intradayCandles: Candle[];
  intradayArea: SeriesPoint[];
  isIntradayRange: boolean;
  onRangeInfer?: (range: Range) => void;
}) {
  const { resolvedTheme } = useTheme();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const chartApiRef = React.useRef<{
    setVisibleLogicalRange: (range: { from: number; to: number }) => void;
    seriesLength: number;
  } | null>(null);
  const skipNextRangeApply = React.useRef(false);
  const volumeEnabled = showVolume && type === "candles";
  const chartHeight = volumeEnabled ? Math.max(320, height) : height;

  const seriesCandles = isIntradayRange ? intradayCandles : eodAll;
  const seriesForWindow = isIntradayRange
    ? type === "area"
      ? intradayArea
      : intradayCandles
    : eodAll;

  // Create / rebuild chart when data mode or series changes (not on every range chip click).
  React.useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const dark = resolvedTheme !== "light";
    const c = palette(dark);
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const lwc = await import("lightweight-charts");
      if (disposed) return;

      const longHistory = !isIntradayRange && eodAll.length > 800;
      const width = Math.max(1, Math.floor(el.clientWidth));
      const toTime = (ts: number) =>
        (isIntradayRange ? ts : toBusinessDay(ts)) as never;

      const chart = lwc.createChart(el, {
        width,
        height: chartHeight,
        layout: {
          background: { type: lwc.ColorType.Solid, color: "transparent" },
          textColor: c.text,
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          attributionLogo: false,
        },
        grid: { vertLines: { color: c.grid }, horzLines: { color: c.grid } },
        rightPriceScale: { borderColor: c.border },
        timeScale: {
          borderColor: c.border,
          timeVisible: isIntradayRange,
          secondsVisible: false,
          minBarSpacing: longHistory ? 0.01 : 0.5,
          rightOffset: 4,
        },
        crosshair: { mode: lwc.CrosshairMode.Normal },
        handleScroll: {
          mouseWheel: false,
          pressedMouseMove: true,
          horzTouchDrag: true,
          vertTouchDrag: false,
        },
        handleScale: {
          mouseWheel: false,
          pinch: true,
          axisPressedMouseMove: { time: true, price: true },
          axisDoubleClickReset: true,
        },
        kineticScroll: {
          mouse: true,
          touch: true,
        },
      });

      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        chart.applyOptions({
          width: Math.max(1, Math.floor(entry.contentRect.width)),
          height: chartHeight,
        });
      });
      resizeObserver.observe(el);

      const syncInferredRange = () => {
        const visible = chart.timeScale().getVisibleLogicalRange();
        if (!visible || !onRangeInfer) return;
        const inferred = inferRangeFromVisible(
          seriesForWindow,
          visible.from,
          visible.to,
          isIntradayRange
        );
        if (inferred) {
          skipNextRangeApply.current = true;
          onRangeInfer(inferred);
        }
      };

      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        event.stopPropagation();
        const ts = chart.timeScale();
        const visible = ts.getVisibleLogicalRange();
        if (!visible) return;

        const n = seriesForWindow.length;
        const span = Math.max(visible.to - visible.from, 2);

        // Vertical → zoom (anchored to the latest bar, TradingView-style).
        if (Math.abs(event.deltaY) >= Math.abs(event.deltaX) && event.deltaY !== 0) {
          const zoomIn = event.deltaY < 0;
          const factor = zoomIn ? 0.82 : 1.22;
          const nextSpan = Math.min(Math.max(span * factor, 8), Math.max(n, 8));
          const to = Math.min(n - 0.5, visible.to);
          const from = Math.max(-0.5, to - nextSpan);
          ts.setVisibleLogicalRange({ from, to });
          syncInferredRange();
          return;
        }

        // Horizontal → pan.
        if (event.deltaX !== 0) {
          const shift = (event.deltaX / Math.max(el.clientWidth, 1)) * span;
          ts.setVisibleLogicalRange({
            from: visible.from + shift,
            to: visible.to + shift,
          });
          syncInferredRange();
        }
      };
      el.addEventListener("wheel", onWheel, { passive: false });

      try {
        if (isIntradayRange && type === "area") {
          if (!intradayArea.length) throw new Error("empty intraday");
          const series = chart.addSeries(lwc.AreaSeries, {
            lineColor: c.line,
            topColor: c.areaTop,
            bottomColor: c.areaBottom,
            lineWidth: 2,
          });
          series.setData(intradayArea.map((p) => ({ time: p.time as never, value: p.value })));
        } else if (type === "candles") {
          if (!seriesCandles.length) throw new Error("empty candles");
          const series = chart.addSeries(lwc.CandlestickSeries, {
            upColor: c.up,
            downColor: c.down,
            borderUpColor: c.up,
            borderDownColor: c.down,
            wickUpColor: c.up,
            wickDownColor: c.down,
          });
          series.setData(
            seriesCandles.map((d) => ({
              time: toTime(d.time),
              open: d.open,
              high: d.high,
              low: d.low,
              close: d.close,
            }))
          );

          if (volumeEnabled) {
            const hasVol = seriesCandles.some((d) => (d.volume ?? 0) > 0);
            if (hasVol) {
              const volumeSeries = chart.addSeries(lwc.HistogramSeries, {
                priceFormat: { type: "volume" },
                priceScaleId: "volume",
              });
              chart.priceScale("volume").applyOptions({
                scaleMargins: { top: 0.78, bottom: 0 },
              });
              chart.priceScale("right").applyOptions({
                scaleMargins: { top: 0.05, bottom: 0.28 },
              });
              volumeSeries.setData(
                seriesCandles.map((d) => ({
                  time: toTime(d.time),
                  value: d.volume ?? 0,
                  color: d.close >= d.open ? c.volumeUp : c.volumeDown,
                }))
              );
            }
          }
        } else {
          if (!eodAll.length) throw new Error("empty eod");
          const series = chart.addSeries(lwc.AreaSeries, {
            lineColor: c.line,
            topColor: c.areaTop,
            bottomColor: c.areaBottom,
            lineWidth: 2,
          });
          series.setData(
            eodAll.map((d) => ({ time: toBusinessDay(d.time) as never, value: d.close }))
          );
        }

        chartApiRef.current = {
          setVisibleLogicalRange: (r) => chart.timeScale().setVisibleLogicalRange(r),
          seriesLength: seriesForWindow.length,
        };

        applyRangeWindow(
          (r) => chart.timeScale().setVisibleLogicalRange(r),
          visibleBarCount(seriesForWindow, range),
          range,
          seriesForWindow.length
        );
      } catch (err) {
        console.error("[PriceChart] setData failed", { range, type, err });
      }

      cleanup = () => {
        el.removeEventListener("wheel", onWheel);
        resizeObserver.disconnect();
        chartApiRef.current = null;
        chart.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
    // range intentionally omitted — applied in the effect below so zoom can keep full data.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- range applied separately
  }, [
    resolvedTheme,
    type,
    chartHeight,
    volumeEnabled,
    isIntradayRange,
    eodAll,
    intradayCandles,
    intradayArea,
    seriesCandles,
    seriesForWindow,
    onRangeInfer,
  ]);

  // Range chip click → reframe the visible window without rebuilding the series.
  React.useEffect(() => {
    if (skipNextRangeApply.current) {
      skipNextRangeApply.current = false;
      return;
    }
    const api = chartApiRef.current;
    if (!api) return;
    applyRangeWindow(
      api.setVisibleLogicalRange,
      visibleBarCount(seriesForWindow, range),
      range,
      seriesForWindow.length
    );
  }, [range, seriesForWindow]);

  return (
    <div
      ref={containerRef}
      style={{ height: chartHeight, overscrollBehavior: "contain", touchAction: "none" }}
      className="relative min-h-64 w-full overflow-hidden rounded-xl border border-border/60 bg-muted/10"
    />
  );
}

function ChartToolbar({
  type,
  range,
  labels,
  hasIntraday,
  hideTypeToggle,
  onTypeChange,
  onRangeChange,
  expandLabel,
  onExpandToggle,
}: {
  type: ChartType;
  range: Range;
  labels: { area: string; candles: string };
  hasIntraday: boolean;
  hideTypeToggle?: boolean;
  onTypeChange: (type: ChartType) => void;
  onRangeChange: (range: Range) => void;
  expandLabel: string;
  onExpandToggle: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {hideTypeToggle ? null : (
          <div
            role="group"
            aria-label="Chart style"
            className="inline-flex w-fit rounded-xl border border-border bg-muted/40 p-1 shadow-inner"
          >
            {(
              [
                { id: "area" as const, label: labels.area, Icon: ChartLine },
                { id: "candles" as const, label: labels.candles, Icon: ChartCandlestick },
              ] as const
            ).map(({ id, label, Icon }) => {
              const selected = type === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onTypeChange(id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold tracking-wide transition-all",
                    selected
                      ? "bg-emerald-600 text-white shadow-md ring-1 ring-emerald-500/40"
                      : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
                  )}
                >
                  <Icon className="size-3.5 shrink-0" aria-hidden />
                  {label}
                </button>
              );
            })}
          </div>
        )}
        <button
          type="button"
          onClick={onExpandToggle}
          title={expandLabel}
          aria-label={expandLabel}
          className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-muted/30 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          {expandLabel === "Collapse chart" ? (
            <Minimize2 className="size-4" />
          ) : (
            <Expand className="size-4" />
          )}
        </button>
      </div>
      <div className="flex max-w-full flex-wrap rounded-lg border border-border bg-muted/30 p-0.5">
        {RANGES.map((r) => {
          if (INTRADAY_RANGES.has(r) && !hasIntraday) return null;
          return (
            <button
              key={r}
              type="button"
              onClick={() => onRangeChange(r)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
                range === r
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PriceChart({
  candles,
  intraday,
  className,
  height = 380,
  defaultType = "candles",
  hideTypeToggle = false,
  defaultRange = "3M",
  typeLabels,
  showVolume = false,
}: {
  candles: Candle[];
  intraday?: SeriesPoint[];
  className?: string;
  height?: number;
  defaultType?: ChartType;
  hideTypeToggle?: boolean;
  defaultRange?: Range;
  /** Custom labels for the type toggle, e.g. { area: "TrendView", candles: "TradingView" } */
  typeLabels?: Partial<Record<ChartType, string>>;
  /** Show volume histogram under candlesticks (TradingView mode). */
  showVolume?: boolean;
}) {
  const [type, setType] = React.useState<ChartType>(defaultType);
  const [range, setRange] = React.useState<Range>(defaultRange);
  const [expanded, setExpanded] = React.useState(false);
  const [expandedHeight, setExpandedHeight] = React.useState(560);

  const labels = {
    area: typeLabels?.area ?? "Area",
    candles: typeLabels?.candles ?? "Candles",
  };
  const series = useChartSeries(candles, intraday, range);

  const onRangeInfer = React.useCallback((next: Range) => {
    setRange((prev) => (prev === next ? prev : next));
  }, []);

  React.useEffect(() => {
    if (!expanded) return;
    function syncHeight() {
      setExpandedHeight(Math.max(360, Math.min(window.innerHeight - 180, 780)));
    }
    syncHeight();
    window.addEventListener("resize", syncHeight);
    return () => window.removeEventListener("resize", syncHeight);
  }, [expanded]);

  const canvasProps = {
    type,
    range,
    showVolume,
    eodAll: series.eodAll,
    intradayCandles: series.intradayCandles,
    intradayArea: series.intradayArea,
    isIntradayRange: series.isIntradayRange,
    onRangeInfer,
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <ChartToolbar
        type={type}
        range={range}
        labels={labels}
        hasIntraday={series.hasIntraday}
        hideTypeToggle={hideTypeToggle}
        onTypeChange={setType}
        onRangeChange={setRange}
        expandLabel="Expand chart"
        onExpandToggle={() => setExpanded(true)}
      />
      <ChartCanvas {...canvasProps} height={height} />

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent
          showCloseButton
          className="flex h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-7xl flex-col gap-3 overflow-hidden overscroll-contain p-3 pt-10 [touch-action:none] sm:max-w-[min(1200px,calc(100%-2rem))] sm:p-4 sm:pt-10"
        >
          <DialogHeader className="shrink-0 space-y-1 pr-2 text-left">
            <DialogTitle className="text-base">Expanded chart</DialogTitle>
            <DialogDescription className="text-xs">
              Scroll up/down to zoom · scroll left/right or drag to pan
            </DialogDescription>
          </DialogHeader>

          <ChartToolbar
            type={type}
            range={range}
            labels={labels}
            hasIntraday={series.hasIntraday}
            hideTypeToggle={hideTypeToggle}
            onTypeChange={setType}
            onRangeChange={setRange}
            expandLabel="Collapse chart"
            onExpandToggle={() => setExpanded(false)}
          />

          <div className="min-h-0 flex-1">
            <ChartCanvas {...canvasProps} height={expandedHeight} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
