import "server-only";
import { getEodCandlesCached } from "@/lib/services/history";
import { getIndexSummariesCached } from "@/lib/services/history";
import { getQuotes } from "@/lib/services/prices";
import { KSE100_SYMBOL, PSX_TIMEZONE } from "@/lib/constants";

export interface PerfPoint {
  date: string; // YYYY-MM-DD
  [key: string]: number | string | null;
}

export interface PerfSeries {
  key: string;
  dailyKey: string;
  name: string;
  color: string;
  kind: "benchmark" | "portfolio";
}

export interface PerformanceResult {
  points: PerfPoint[];
  series: PerfSeries[];
}

interface PositionInput {
  symbol: string;
  quantity: number;
}

export interface PortfolioPerformanceInput {
  id: string;
  name: string;
  positions: PositionInput[];
}

/**
 * Build return curves over the last `days` trading days. The chart compares
 * KSE-100 return with each current portfolio's simulated return using today's
 * holdings. Historical days use EOD closes; the latest day uses live quotes.
 *
 * In demo mode the candles are deterministic mock data; live mode triggers one
 * EOD fetch per distinct symbol (adapter caches/falls back gracefully).
 */
export async function getPortfolioPerformance(
  portfolios: PortfolioPerformanceInput[],
  days = 120
): Promise<PerformanceResult> {
  const activePortfolios = portfolios.filter((p) => p.positions.length > 0);
  if (activePortfolios.length === 0) return { points: [], series: [] };

  // Fetch candles for each distinct symbol + the benchmark.
  const symbols = Array.from(
    new Set(activePortfolios.flatMap((p) => p.positions.map((pos) => pos.symbol.toUpperCase())))
  );
  const [seriesList, benchCandles, liveQuotes, indexSummaries] = await Promise.all([
    Promise.all(
      symbols.map(async (s) => ({
        symbol: s,
        byDate: toDateCloseMap(await getEodCandlesCached(s)),
      }))
    ),
    getEodCandlesCached(KSE100_SYMBOL),
    getQuotes(symbols),
    getIndexSummariesCached().catch(() => []),
  ]);

  const closeBySymbol = new Map(seriesList.map((x) => [x.symbol, x.byDate]));
  const benchByDate = toDateCloseMap(benchCandles);
  const today = todayInPkt();

  for (const [symbol, quote] of liveQuotes) {
    closeBySymbol.get(symbol)?.set(today, quote.price);
  }
  const liveKse = indexSummaries.find((summary) => summary.symbol.toUpperCase() === KSE100_SYMBOL);
  if (liveKse?.current) benchByDate.set(today, liveKse.current);

  // Union of all dates, ascending.
  const dateSet = new Set<string>();
  for (const { byDate } of seriesList) for (const d of byDate.keys()) dateSet.add(d);
  for (const d of benchByDate.keys()) dateSet.add(d);
  const allDates = Array.from(dateSet).sort();
  const dates = allDates.slice(-days);

  const portfolioSeries = activePortfolios.map((portfolio, index) => ({
    key: seriesKey(portfolio.id),
    dailyKey: `${seriesKey(portfolio.id)}Daily`,
    name: portfolio.name,
    color: SERIES_COLORS[index % SERIES_COLORS.length],
    kind: "portfolio" as const,
    positions: portfolio.positions,
  }));
  const series: PerfSeries[] = [
    {
      key: "kse100",
      dailyKey: "kse100Daily",
      name: "KSE-100",
      color: "var(--chart-2)",
      kind: "benchmark",
    },
    ...portfolioSeries.map((item) => ({
      key: item.key,
      dailyKey: item.dailyKey,
      name: item.name,
      color: item.color,
      kind: item.kind,
    })),
  ];

  const lastClose = new Map<string, number>();
  const points: PerfPoint[] = [];
  let benchLast = 0;
  let benchStart = 0;
  let benchPrev = 0;
  const startByPortfolio = new Map<string, number>();
  const prevByPortfolio = new Map<string, number>();

  for (const date of dates) {
    for (const sym of symbols) {
      const close = closeBySymbol.get(sym)?.get(date) ?? lastClose.get(sym);
      if (close != null) lastClose.set(sym, close);
    }
    benchLast = benchByDate.get(date) ?? benchLast;
    const point: PerfPoint = { date };

    if (benchLast > 0) {
      if (benchStart === 0) benchStart = benchLast;
      point.kse100 = pctChange(benchLast, benchStart);
      point.kse100Daily = benchPrev > 0 ? pctChange(benchLast, benchPrev) : 0;
      benchPrev = benchLast;
    }

    for (const portfolio of portfolioSeries) {
      const value = portfolio.positions.reduce((sum, position) => {
        const close = lastClose.get(position.symbol.toUpperCase()) ?? 0;
        return sum + close * position.quantity;
      }, 0);
      if (value <= 0) {
        point[portfolio.key] = null;
        point[portfolio.dailyKey] = null;
        continue;
      }

      if (!startByPortfolio.has(portfolio.key)) {
        startByPortfolio.set(portfolio.key, value);
      }
      const startValue = startByPortfolio.get(portfolio.key) ?? value;
      const previousValue = prevByPortfolio.get(portfolio.key);
      point[portfolio.key] = pctChange(value, startValue);
      point[portfolio.dailyKey] = previousValue ? pctChange(value, previousValue) : 0;
      prevByPortfolio.set(portfolio.key, value);
    }

    points.push(point);
  }

  return {
    points: points.filter((point) =>
      series.some((item) => typeof point[item.key] === "number")
    ),
    series,
  };
}

const SERIES_COLORS = [
  "var(--chart-1)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
];

function seriesKey(id: string): string {
  return `portfolio_${id.replace(/[^a-zA-Z0-9]/g, "_")}`;
}

function todayInPkt(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PSX_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function pctChange(value: number, basis: number): number {
  if (!basis) return 0;
  return round2(((value - basis) / basis) * 100);
}

function toDateCloseMap(candles: { time: number; close: number }[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const c of candles) {
    m.set(new Date(c.time * 1000).toISOString().slice(0, 10), c.close);
  }
  return m;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
