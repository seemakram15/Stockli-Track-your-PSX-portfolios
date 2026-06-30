import type {
  FinancialTableRow,
  StockFinancialsData,
  StockFinancialTabId,
} from "@/lib/types/stock-fundamentals";

export type MetricPoint = {
  period: string;
  value: number;
};

export type StockAnalyzerQuote = {
  current: number;
  change: number;
  changePct: number;
  ldcp: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
};

export type AnalyzerSummary = {
  symbol: string;
  name: string;
  sector: string;
  quote: StockAnalyzerQuote | null;
  marketCap: number | null;
  bookValue: number | null;
  eps: number | null;
  dps: number | null;
  pe: number | null;
  pbv: number | null;
  dividendYield: number | null;
  payoutRatio: number | null;
  roe: number | null;
  netMargin: number | null;
  debtToEquity: number | null;
  revenueGrowth: number | null;
  epsGrowth: number | null;
  priceToBookSignal: "cheap" | "fair" | "expensive";
  healthScore: number;
  riskScore: number;
  verdict: string;
  businessText: string;
  revenue: MetricPoint[];
  profit: MetricPoint[];
  epsSeries: MetricPoint[];
  dpsSeries: MetricPoint[];
};

export function buildAnalyzerSummary(
  data: StockFinancialsData,
  quote: StockAnalyzerQuote | null
): AnalyzerSummary {
  const company = data.company;
  const revenue = findSeries(data, [/^net sales$/i, /^sales$/i, /revenue/i]);
  const profit = findSeries(data, [
    /^profit after tax$/i,
    /profit after tax a\/t company owners/i,
    /net income/i,
  ]);
  const epsSeries = findSeries(data, [/^eps - basic$/i, /^eps \(pkr\)$/i, /^eps$/i]);
  const dpsSeries = findSeries(data, [/^dps/i, /dividend per share/i]);
  const bookValue = latestMetric(data, [/^bvps/i, /book value/i]);
  const eps = latestFromSeries(epsSeries);
  const dps = latestFromSeries(dpsSeries);
  const pe = latestMetric(data, [/^per \(x\)$/i, /^pe$/i, /^p\/e/i]);
  const pbv = latestMetric(data, [/^pbv$/i, /^p\/b/i]);
  const dividendYield = latestMetric(data, [/div yield/i, /dividend yield/i]);
  const roe = latestMetric(data, [/^roe/i, /return on equity/i]);
  const netMargin = latestMetric(data, [/net margin/i]);
  const debtToEquity = latestMetric(data, [/debt to equity/i]);
  const marketCap = latestMetric(data, [/market cap/i]);
  const payoutRatio = eps && dps ? (dps / eps) * 100 : null;
  const revenueGrowth = growth(revenue);
  const epsGrowth = growth(epsSeries);
  const price = quote?.current ?? latestValueFromRows(data, [/current price/i, /^close/i]);
  const priceToBookSignal =
    price && bookValue
      ? price / bookValue < 1.2
        ? "cheap"
        : price / bookValue > 3
          ? "expensive"
          : "fair"
      : "fair";
  const healthScore = clamp(
    50 +
      scorePositive(roe, 15, 10) +
      scorePositive(netMargin, 10, 10) +
      scorePositive(revenueGrowth, 5, 10) +
      scorePositive(epsGrowth, 5, 10) +
      scoreNegative(debtToEquity, 100, 10) +
      scorePositive(dividendYield, 4, 5),
    0,
    100
  );
  const riskScore = clamp(
    45 +
      scorePositive(debtToEquity, 100, 20) +
      scorePositive(pe, 25, 10) +
      (priceToBookSignal === "expensive" ? 15 : 0) -
      scorePositive(roe, 15, 10),
    0,
    100
  );
  const verdict =
    healthScore >= 72
      ? "Healthy fundamentals with a constructive risk profile."
      : healthScore >= 55
        ? "Mixed but usable fundamentals. Watch valuation and earnings trend."
        : "Weak or incomplete fundamentals. Treat this as a higher-risk candidate.";

  return {
    symbol: data.symbol,
    name: company?.name ?? data.symbol,
    sector: company?.sector ?? "Unknown",
    quote,
    marketCap,
    bookValue,
    eps,
    dps,
    pe,
    pbv,
    dividendYield,
    payoutRatio,
    roe,
    netMargin,
    debtToEquity,
    revenueGrowth,
    epsGrowth,
    priceToBookSignal,
    healthScore: Math.round(healthScore),
    riskScore: Math.round(riskScore),
    verdict,
    businessText: buildBusinessText(data),
    revenue,
    profit,
    epsSeries,
    dpsSeries,
  };
}

export function buildBusinessText(data: StockFinancialsData) {
  const name = data.company?.name ?? data.symbol;
  const sector = data.company?.sector ?? "its sector";
  const latest =
    data.tabs.latest?.status === "ok" ? "recent reported results" : "cached financial records";
  return `${name} operates in ${sector}. This analysis reads ${latest}, statement history, ratios and market movement to explain profitability, valuation, debt pressure and dividend behavior in simple language.`;
}

export function findSeries(data: StockFinancialsData, patterns: RegExp[]): MetricPoint[] {
  const row = findRow(data, patterns);
  if (!row) return [];
  return Object.entries(row.values)
    .map(([period, raw]) => ({ period, value: parseNumber(raw) }))
    .filter((point): point is MetricPoint => point.value != null)
    .slice(-8);
}

export function latestMetric(data: StockFinancialsData, patterns: RegExp[]) {
  const series = findSeries(data, patterns);
  return latestFromSeries(series);
}

export function latestFromSeries(series: MetricPoint[]) {
  return series.length ? series[series.length - 1].value : null;
}

export function latestValueFromRows(data: StockFinancialsData, patterns: RegExp[]) {
  return latestMetric(data, patterns);
}

export function findRow(data: StockFinancialsData, patterns: RegExp[]): FinancialTableRow | null {
  const tabs: StockFinancialTabId[] = ["overview", "latest", "income", "balance", "cashflow", "ratios"];
  for (const tab of tabs) {
    for (const table of data.tabs[tab]?.tables ?? []) {
      for (const row of table.rows) {
        if (row.isSection) continue;
        if (patterns.some((pattern) => pattern.test(row.label))) return row;
      }
    }
  }
  return null;
}

export function getPriceLikeSeries(data: StockFinancialsData) {
  const priceSeries = findSeries(data, [/^close \(pkr\)$/i, /^close$/i, /adjusted stock prices/i]);
  return priceSeries.length ? priceSeries : findSeries(data, [/^eps/i]);
}

export function growth(series: MetricPoint[]) {
  if (series.length < 2) return null;
  const first = series.find((point) => point.value !== 0)?.value;
  const last = latestFromSeries(series);
  if (!first || last == null) return null;
  return ((last - first) / Math.abs(first)) * 100;
}

export function parseNumber(value: string | number | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (value == null) return null;
  const text = String(value).trim();
  if (!text || text === "-" || text.toLowerCase() === "n/a") return null;
  const negative = /^\(.+\)$/.test(text) || text.startsWith("-");
  const parsed = Number(text.replace(/[(),%xA-Za-z\s]/g, ""));
  if (!Number.isFinite(parsed)) return null;
  return negative ? -Math.abs(parsed) : parsed;
}

function scorePositive(value: number | null, threshold: number, points: number) {
  if (value == null) return 0;
  return value >= threshold ? points : value > 0 ? points / 2 : -points / 2;
}

function scoreNegative(value: number | null, threshold: number, points: number) {
  if (value == null) return 0;
  return value <= threshold ? points : -points;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
