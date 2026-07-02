import type {
  FinancialMetric,
  FinancialTableRow,
  StockFinancialTabId,
  StockFinancialsData,
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

export type AnalyzerFactorId =
  | "roce"
  | "roe"
  | "operating-margin"
  | "net-margin"
  | "cfo-to-net-income"
  | "fcf-yield"
  | "net-debt-to-ebitda"
  | "interest-coverage"
  | "pe-ratio"
  | "ev-to-ebitda"
  | "gross-margin"
  | "debt-to-equity"
  | "current-ratio"
  | "receivable-days"
  | "pb-ratio"
  | "dividend-yield";

export type AnalyzerFactorFormat =
  | "percent"
  | "multiple"
  | "days"
  | "currency"
  | "number";

export type AnalyzerFactorStatus = "strong" | "good" | "mixed" | "weak" | "missing";
export type AnalyzerFactorDirection = "higher" | "lower";
export type AnalyzerFactorCategoryId =
  | "quality"
  | "cash-flow"
  | "balance-sheet"
  | "valuation";

export type AnalyzerFactor = {
  id: AnalyzerFactorId;
  label: string;
  shortLabel: string;
  categoryId: AnalyzerFactorCategoryId;
  categoryLabel: string;
  formula: string;
  whatIsGood: string;
  direction: AnalyzerFactorDirection;
  format: AnalyzerFactorFormat;
  value: number | null;
  displayValue: string;
  scoreOutOf10: number;
  score: number;
  status: AnalyzerFactorStatus;
  sourceLabel: string;
  explanation: string;
};

export type AnalyzerCategoryScore = {
  id: AnalyzerFactorCategoryId;
  label: string;
  score: number;
  available: number;
  summary: string;
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
  priceReturn1Y: number | null;
  totalScore: number;
  healthScore: number;
  riskScore: number;
  factorsAvailable: number;
  factors: AnalyzerFactor[];
  categoryScores: AnalyzerCategoryScore[];
  strongestFactors: AnalyzerFactor[];
  weakestFactors: AnalyzerFactor[];
  verdict: string;
  verdictTone: "strong" | "good" | "mixed" | "weak";
  businessText: string;
  priceToBookSignal: "cheap" | "fair" | "expensive";
  revenue: MetricPoint[];
  profit: MetricPoint[];
  epsSeries: MetricPoint[];
  dpsSeries: MetricPoint[];
  cashflowSeries: MetricPoint[];
  freeCashFlowSeries: MetricPoint[];
};

export type AnalyzerFactorComparison = {
  id: AnalyzerFactorId;
  label: string;
  shortLabel: string;
  categoryLabel: string;
  formula: string;
  whatIsGood: string;
  direction: AnalyzerFactorDirection;
  format: AnalyzerFactorFormat;
  firstValue: number | null;
  secondValue: number | null;
  firstDisplay: string;
  secondDisplay: string;
  firstScore: number;
  secondScore: number;
  firstHealthScore: number;
  secondHealthScore: number;
  winner: "first" | "second" | "tie";
  note: string;
};

export type AnalyzerComparison = {
  winnerSymbol: string | "Balanced";
  winnerLabel: string;
  firstWins: number;
  secondWins: number;
  ties: number;
  summary: string;
  decisiveFactors: AnalyzerFactorComparison[];
  factors: AnalyzerFactorComparison[];
  factorScoreChart: Array<{ label: string; first: number; second: number }>;
  categoryScoreChart: Array<{ category: string; first: number; second: number }>;
};

type FactorDefinition = {
  id: AnalyzerFactorId;
  label: string;
  shortLabel: string;
  categoryId: AnalyzerFactorCategoryId;
  formula: string;
  whatIsGood: string;
  direction: AnalyzerFactorDirection;
  format: AnalyzerFactorFormat;
};

type BaseMetrics = {
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
  priceReturn1Y: number | null;
  revenue: MetricPoint[];
  profit: MetricPoint[];
  epsSeries: MetricPoint[];
  dpsSeries: MetricPoint[];
  cashflowSeries: MetricPoint[];
  freeCashFlowSeries: MetricPoint[];
};

const FACTOR_DEFINITIONS: FactorDefinition[] = [
  {
    id: "roce",
    label: "ROCE",
    shortLabel: "ROCE",
    categoryId: "quality",
    formula: "EBIT / (Total Equity + Total Debt - Cash - ST Investments)",
    whatIsGood: "Higher is better",
    direction: "higher",
    format: "percent",
  },
  {
    id: "roe",
    label: "ROE",
    shortLabel: "ROE",
    categoryId: "quality",
    formula: "Profit After Tax / Total Equity",
    whatIsGood: "Higher is better, but not with too much debt",
    direction: "higher",
    format: "percent",
  },
  {
    id: "operating-margin",
    label: "Operating Margin",
    shortLabel: "Op. Margin",
    categoryId: "quality",
    formula: "Operating Profit / Net Sales",
    whatIsGood: "Higher is better",
    direction: "higher",
    format: "percent",
  },
  {
    id: "net-margin",
    label: "Net Margin",
    shortLabel: "Net Margin",
    categoryId: "quality",
    formula: "Profit After Tax / Net Sales",
    whatIsGood: "Higher is better",
    direction: "higher",
    format: "percent",
  },
  {
    id: "cfo-to-net-income",
    label: "CFO / Net Income",
    shortLabel: "CFO / NI",
    categoryId: "cash-flow",
    formula: "Operating Cash Flow / Profit After Tax",
    whatIsGood: "Above 1.0x is strong",
    direction: "higher",
    format: "multiple",
  },
  {
    id: "fcf-yield",
    label: "Free Cash Flow Yield",
    shortLabel: "FCF Yield",
    categoryId: "cash-flow",
    formula: "(Operating Cash Flow - CAPEX) / Market Cap",
    whatIsGood: "Higher is better",
    direction: "higher",
    format: "percent",
  },
  {
    id: "net-debt-to-ebitda",
    label: "Net Debt / EBITDA",
    shortLabel: "Net Debt / EBITDA",
    categoryId: "balance-sheet",
    formula: "(Total Debt - Cash - ST Investments) / EBITDA",
    whatIsGood: "Lower is better",
    direction: "lower",
    format: "multiple",
  },
  {
    id: "interest-coverage",
    label: "Interest Coverage",
    shortLabel: "Int. Coverage",
    categoryId: "balance-sheet",
    formula: "EBIT / Financial Charges",
    whatIsGood: "Higher is better",
    direction: "higher",
    format: "multiple",
  },
  {
    id: "pe-ratio",
    label: "P/E Ratio",
    shortLabel: "P/E",
    categoryId: "valuation",
    formula: "Market Price / EPS",
    whatIsGood: "Lower is better only if quality is good",
    direction: "lower",
    format: "multiple",
  },
  {
    id: "ev-to-ebitda",
    label: "EV/EBITDA",
    shortLabel: "EV/EBITDA",
    categoryId: "valuation",
    formula: "(Market Cap + Total Debt - Cash - ST Investments) / EBITDA",
    whatIsGood: "Lower is better",
    direction: "lower",
    format: "multiple",
  },
  {
    id: "gross-margin",
    label: "Gross Margin",
    shortLabel: "Gross Margin",
    categoryId: "quality",
    formula: "Gross Profit / Net Sales",
    whatIsGood: "Higher is better",
    direction: "higher",
    format: "percent",
  },
  {
    id: "debt-to-equity",
    label: "Debt to Equity",
    shortLabel: "Debt / Equity",
    categoryId: "balance-sheet",
    formula: "Total Debt / Total Equity",
    whatIsGood: "Lower is better",
    direction: "lower",
    format: "multiple",
  },
  {
    id: "current-ratio",
    label: "Current Ratio",
    shortLabel: "Current Ratio",
    categoryId: "balance-sheet",
    formula: "Current Assets / Current Liabilities",
    whatIsGood: "Above 1.0x is safer",
    direction: "higher",
    format: "multiple",
  },
  {
    id: "receivable-days",
    label: "Receivable Days",
    shortLabel: "Recv. Days",
    categoryId: "balance-sheet",
    formula: "Trade Debts / Net Sales × 365",
    whatIsGood: "Lower is better",
    direction: "lower",
    format: "days",
  },
  {
    id: "pb-ratio",
    label: "P/B Ratio",
    shortLabel: "P/B",
    categoryId: "valuation",
    formula: "Market Price / BVPS",
    whatIsGood: "Lower is better if company quality is good",
    direction: "lower",
    format: "multiple",
  },
  {
    id: "dividend-yield",
    label: "Dividend Yield",
    shortLabel: "Div. Yield",
    categoryId: "valuation",
    formula: "Dividend Per Share / Market Price",
    whatIsGood: "Higher is better if the payout is sustainable",
    direction: "higher",
    format: "percent",
  },
];

const CATEGORY_LABELS: Record<AnalyzerFactorCategoryId, string> = {
  quality: "Business quality",
  "cash-flow": "Cash flow",
  "balance-sheet": "Balance sheet",
  valuation: "Valuation",
};

export function buildAnalyzerSummary(
  data: StockFinancialsData,
  quote: StockAnalyzerQuote | null
): AnalyzerSummary {
  const base = collectBaseMetrics(data, quote);
  const rawFactors = collectFactorValues(data, quote, base);
  const sources = collectFactorSources(rawFactors);
  const factors = FACTOR_DEFINITIONS.map((definition) =>
    buildFactor(definition, rawFactors, sources)
  );
  const scoredFactors = factors.filter((factor) => factor.status !== "missing");
  const totalScore = scoredFactors.length
    ? Math.round(
        (scoredFactors.reduce((sum, factor) => sum + factor.scoreOutOf10, 0) /
          scoredFactors.length) *
          10
      )
    : 0;
  const strongestFactors = [...scoredFactors]
    .sort((left, right) => right.scoreOutOf10 - left.scoreOutOf10)
    .slice(0, 4);
  const weakestFactors = [...scoredFactors]
    .sort((left, right) => left.scoreOutOf10 - right.scoreOutOf10)
    .slice(0, 4);
  const categoryScores = buildCategoryScores(factors);
  const verdictTone = totalScore >= 75 ? "strong" : totalScore >= 60 ? "good" : totalScore >= 45 ? "mixed" : "weak";
  const verdict =
    verdictTone === "strong"
      ? "Strong fundamentals. This stock is winning on several quality and cash flow checks."
      : verdictTone === "good"
        ? "Good overall profile. The business has more positives than negatives right now."
        : verdictTone === "mixed"
          ? "Mixed setup. Some factors are healthy, but a few weak spots need attention."
          : "Weak snapshot. The stock needs more proof before it looks comfortable on fundamentals.";
  const priceToBookSignal =
    base.pbv == null ? "fair" : base.pbv <= 1.2 ? "cheap" : base.pbv <= 2.5 ? "fair" : "expensive";

  return {
    symbol: data.symbol,
    name: data.company?.name ?? data.symbol,
    sector: data.company?.sector ?? "Unknown",
    quote,
    marketCap: base.marketCap,
    bookValue: base.bookValue,
    eps: base.eps,
    dps: base.dps,
    pe: base.pe,
    pbv: base.pbv,
    dividendYield: base.dividendYield,
    payoutRatio: base.payoutRatio,
    roe: base.roe,
    netMargin: base.netMargin,
    debtToEquity: base.debtToEquity,
    revenueGrowth: base.revenueGrowth,
    epsGrowth: base.epsGrowth,
    priceReturn1Y: base.priceReturn1Y,
    totalScore,
    healthScore: totalScore,
    riskScore: Math.max(0, 100 - totalScore),
    factorsAvailable: scoredFactors.length,
    factors,
    categoryScores,
    strongestFactors,
    weakestFactors,
    verdict,
    verdictTone,
    businessText: buildBusinessText(data, totalScore),
    priceToBookSignal,
    revenue: base.revenue,
    profit: base.profit,
    epsSeries: base.epsSeries,
    dpsSeries: base.dpsSeries,
    cashflowSeries: base.cashflowSeries,
    freeCashFlowSeries: base.freeCashFlowSeries,
  };
}

export function buildAnalyzerComparison(
  first: AnalyzerSummary,
  second: AnalyzerSummary
): AnalyzerComparison {
  const firstMap = new Map(first.factors.map((factor) => [factor.id, factor]));
  const secondMap = new Map(second.factors.map((factor) => [factor.id, factor]));
  const factors = FACTOR_DEFINITIONS.map((definition) => {
    const firstFactor = firstMap.get(definition.id);
    const secondFactor = secondMap.get(definition.id);
    const firstValue = firstFactor?.value ?? null;
    const secondValue = secondFactor?.value ?? null;
    const winner = decideWinner(firstValue, secondValue, definition.direction);
    const comparisonScore = buildHeadToHeadScores(firstValue, secondValue, definition.direction);
    return {
      id: definition.id,
      label: definition.label,
      shortLabel: definition.shortLabel,
      categoryLabel: CATEGORY_LABELS[definition.categoryId],
      formula: definition.formula,
      whatIsGood: definition.whatIsGood,
      direction: definition.direction,
      format: definition.format,
      firstValue,
      secondValue,
      firstDisplay: firstFactor?.displayValue ?? "N/A",
      secondDisplay: secondFactor?.displayValue ?? "N/A",
      firstScore: comparisonScore.first,
      secondScore: comparisonScore.second,
      firstHealthScore: firstFactor?.score ?? 0,
      secondHealthScore: secondFactor?.score ?? 0,
      winner,
      note: buildComparisonNote(
        definition,
        first.symbol,
        second.symbol,
        firstFactor?.displayValue ?? "N/A",
        secondFactor?.displayValue ?? "N/A",
        winner
      ),
    } satisfies AnalyzerFactorComparison;
  });

  const firstWins = factors.filter((factor) => factor.winner === "first").length;
  const secondWins = factors.filter((factor) => factor.winner === "second").length;
  const ties = factors.filter((factor) => factor.winner === "tie").length;
  const winnerSymbol =
    firstWins === secondWins ? "Balanced" : firstWins > secondWins ? first.symbol : second.symbol;
  const winnerLabel =
    winnerSymbol === "Balanced"
      ? "Balanced matchup"
      : `${winnerSymbol} leads on the scorecard`;
  const decisiveFactors = [...factors]
    .filter((factor) => factor.winner !== "tie")
    .sort(
      (left, right) =>
        Math.abs(right.firstScore - right.secondScore) -
        Math.abs(left.firstScore - left.secondScore)
    )
    .slice(0, 5);
  const factorScoreChart = factors.map((factor) => ({
    label: factor.shortLabel,
    first: factor.firstScore,
    second: factor.secondScore,
  }));
  const categoryScoreChart = first.categoryScores.map((category) => {
    const secondCategory = second.categoryScores.find((item) => item.id === category.id);
    return {
      category: category.label,
      first: category.score,
      second: secondCategory?.score ?? 0,
    };
  });
  const summary =
    winnerSymbol === "Balanced"
      ? `${first.symbol} and ${second.symbol} are very close. ${first.symbol} wins ${firstWins} factors, ${second.symbol} wins ${secondWins}, and ${ties} are too close to call.`
      : `${winnerSymbol} wins the head-to-head by leading on ${Math.max(firstWins, secondWins)} of ${factors.length} factors. The biggest edge comes from ${decisiveFactors
          .slice(0, 3)
          .map((factor) => factor.label)
          .join(", ")}.`;

  return {
    winnerSymbol,
    winnerLabel,
    firstWins,
    secondWins,
    ties,
    summary,
    decisiveFactors,
    factors,
    factorScoreChart,
    categoryScoreChart,
  };
}

export function buildBusinessText(data: StockFinancialsData, totalScore?: number) {
  const name = data.company?.name ?? data.symbol;
  const sector = data.company?.sector ?? "its sector";
  const scoreText =
    typeof totalScore === "number"
      ? ` Its current factor score is ${totalScore}/100.`
      : "";
  return `${name} operates in ${sector}. This view reads the cached statements, ratios and cash flow history to explain quality, valuation and balance-sheet strength in simple language.${scoreText}`;
}

export function findSeries(
  data: StockFinancialsData,
  patterns: RegExp[],
  options: { tabs?: StockFinancialTabId[]; maxPoints?: number } = {}
): MetricPoint[] {
  const tabs = options.tabs ?? ["income", "balance", "cashflow", "ratios", "latest", "overview"];
  const row = findRowInTabs(data, tabs, patterns);
  if (!row) return [];
  return Object.entries(row.values)
    .map(([period, raw]) => ({ period, value: parseNumber(raw) }))
    .filter((point): point is MetricPoint => point.value != null)
    .sort((left, right) => periodSortValue(left.period) - periodSortValue(right.period))
    .slice(-(options.maxPoints ?? 8));
}

export function latestMetric(
  data: StockFinancialsData,
  patterns: RegExp[],
  options: { tabs?: StockFinancialTabId[] } = {}
) {
  return latestFromSeries(findSeries(data, patterns, { tabs: options.tabs, maxPoints: 24 }));
}

export function latestFromSeries(series: MetricPoint[]) {
  return series.length ? series[series.length - 1].value : null;
}

export function latestValueFromRows(data: StockFinancialsData, patterns: RegExp[]) {
  const row = findRowInTabs(data, ["latest", "overview", "income", "ratios"], patterns);
  if (!row) return null;
  const latest = Object.entries(row.values)
    .map(([period, raw]) => ({ period, value: parseNumber(raw) }))
    .filter((point): point is MetricPoint => point.value != null)
    .sort((left, right) => periodSortValue(left.period) - periodSortValue(right.period))
    .at(-1);
  return latest?.value ?? null;
}

export function findRow(data: StockFinancialsData, patterns: RegExp[]): FinancialTableRow | null {
  return findRowInTabs(data, ["overview", "latest", "income", "balance", "cashflow", "ratios"], patterns);
}

export function getHistoricalPriceSeries(data: StockFinancialsData) {
  return findSeries(data, [/^close \(pkr\)$/i, /^close$/i, /adjusted stock prices/i], {
    tabs: ["latest", "overview"],
    maxPoints: 24,
  });
}

export function getPriceLikeSeries(data: StockFinancialsData) {
  const priceSeries = getHistoricalPriceSeries(data);
  if (priceSeries.length) return priceSeries;
  return findSeries(data, [/^eps$/i, /^eps - basic$/i, /^bvps$/i], {
    tabs: ["ratios", "income", "latest"],
  });
}

export function getFiftyTwoWeekRange(data: StockFinancialsData) {
  return {
    low:
      latestHighlightValue(data, /^52w low$/i) ??
      latestHighlightValue(data, /^52 week low$/i),
    high:
      latestHighlightValue(data, /^52w high$/i) ??
      latestHighlightValue(data, /^52 week high$/i),
  };
}

export function growth(series: MetricPoint[]) {
  if (series.length < 2) return null;
  const first = series.find((point) => point.value !== 0)?.value;
  const last = latestFromSeries(series);
  if (!first || last == null) return null;
  return ((last - first) / Math.abs(first)) * 100;
}

export function trailingGrowth(series: MetricPoint[], points = 2) {
  if (series.length < points) return null;
  return growth(series.slice(-points));
}

export function parseNumber(value: string | number | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (value == null) return null;
  const text = String(value).trim();
  if (!text || text === "-" || text.toLowerCase() === "n/a" || text === "—") return null;
  const negative = /^\(.+\)$/.test(text) || text.startsWith("-");
  const parsed = Number(text.replace(/[(),%xA-Za-z\s]/g, ""));
  if (!Number.isFinite(parsed)) return null;
  return negative ? -Math.abs(parsed) : parsed;
}

function collectBaseMetrics(
  data: StockFinancialsData,
  quote: StockAnalyzerQuote | null
): BaseMetrics {
  const priceSeries = getHistoricalPriceSeries(data);
  const revenue = annualSeries(data, ["income"], [/^net sales$/i, /^sales$/i, /revenue/i]);
  const profit = annualSeries(data, ["income"], [
    /profit after tax a\/t company owners/i,
    /^profit after tax$/i,
    /net income/i,
  ]);
  const epsSeries = annualSeries(data, ["ratios", "income", "latest"], [/^eps$/i, /^eps - basic$/i]);
  const dpsSeries = annualSeries(data, ["ratios", "latest"], [/^dps$/i, /dividend per share/i]);
  const cashflowSeries = annualSeries(data, ["cashflow"], [/^operating cash flow$/i]);
  const freeCashFlowSeries = buildFreeCashFlowSeries(data);

  const bookValue = firstNonNull(
    latestMetric(data, [/^bvps$/i, /book value/i], { tabs: ["ratios", "overview"] }),
    latestMetric(data, [/^bvps$/i], { tabs: ["latest"] })
  );
  const eps = firstNonNull(latestFromSeries(epsSeries), latestValueFromRows(data, [/^eps$/i]));
  const dps = firstNonNull(latestFromSeries(dpsSeries), latestValueFromRows(data, [/^dps$/i]));
  const price = firstNonNull(
    quote?.current ?? null,
    latestValueFromRows(data, [/current price/i, /^close/i]),
    bookValue != null && latestMetric(data, [/^pbv$/i], { tabs: ["ratios"] }) != null
      ? bookValue * (latestMetric(data, [/^pbv$/i], { tabs: ["ratios"] }) ?? 0)
      : null
  );
  const pe = firstNonNull(
    latestMetric(data, [/^per$/i, /^per \(x\)$/i, /^p\/e/i], { tabs: ["ratios", "overview"] }),
    price != null && eps ? price / eps : null
  );
  const pbv = firstNonNull(
    latestMetric(data, [/^pbv$/i, /^p\/b/i], { tabs: ["ratios", "overview"] }),
    price != null && bookValue ? price / bookValue : null
  );
  const dividendYield = firstNonNull(
    latestMetric(data, [/^div yield$/i, /dividend yield/i], { tabs: ["ratios", "overview"] }),
    price != null && dps ? (dps / price) * 100 : null
  );
  const payoutRatio = eps && dps ? (dps / eps) * 100 : null;
  const roe = firstNonNull(
    latestMetric(data, [/^roe$/i, /return on equity/i], { tabs: ["ratios"] }),
    computeRoe(data)
  );
  const netMargin = firstNonNull(
    latestMetric(data, [/^net margin$/i], { tabs: ["ratios"] }),
    computeMargin(data, "net")
  );
  const debtToEquity = computeDebtToEquity(data);
  const cash = latestMetric(data, [/^cash & bank balances$/i], { tabs: ["balance"] });
  const cashAsPercentMktCap = latestMetric(data, [/^cash as a % mkt cap$/i], { tabs: ["ratios"] });
  const marketCap = firstNonNull(
    latestHighlightValue(data, /^market cap$/i),
    cash != null && cashAsPercentMktCap != null && cashAsPercentMktCap > 0
      ? cash / (cashAsPercentMktCap / 100)
      : null
  );

  return {
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
    revenueGrowth: growth(revenue),
    epsGrowth: growth(epsSeries),
    priceReturn1Y: trailingGrowth(priceSeries, 2),
    revenue,
    profit,
    epsSeries,
    dpsSeries,
    cashflowSeries,
    freeCashFlowSeries,
  };
}

function collectFactorValues(
  data: StockFinancialsData,
  quote: StockAnalyzerQuote | null,
  base: BaseMetrics
): Record<AnalyzerFactorId, number | null> {
  const revenue = latestFromSeries(base.revenue);
  const grossProfit = latestMetric(data, [/^gross profit$/i], { tabs: ["income", "latest"] });
  const operatingProfit = latestMetric(data, [/^operating profit$/i], { tabs: ["income", "latest"] });
  const profitAfterTax = firstNonNull(
    latestMetric(data, [/profit after tax a\/t company owners/i], { tabs: ["income", "latest"] }),
    latestMetric(data, [/^profit after tax$/i, /^net income$/i], { tabs: ["cashflow", "income", "latest"] })
  );
  const operatingCashFlow = latestMetric(data, [/^operating cash flow$/i], { tabs: ["cashflow"] });
  const capex = latestMetric(data, [/^capex$/i], { tabs: ["cashflow"] });
  const cash = latestMetric(data, [/^cash & bank balances$/i], { tabs: ["balance"] }) ?? 0;
  const shortTermInvestments =
    latestMetric(data, [/^short term investments$/i], { tabs: ["balance"] }) ?? 0;
  const shortTermDebt = latestMetric(data, [/^short-term debt$/i], { tabs: ["balance"] });
  const currentPortion = latestMetric(data, [/^current portion of long-term debt$/i], {
    tabs: ["balance"],
  });
  const longTermDebt = latestMetric(data, [/^long-term debt$/i], { tabs: ["balance"] });
  const totalDebt = sumNullable(shortTermDebt, currentPortion, longTermDebt);
  const totalEquity =
    latestMetric(data, [/^total equity$/i], { tabs: ["balance"] }) ??
    latestMetric(data, [/^total equity a\/t to holding company$/i], { tabs: ["balance"] });
  const holdingEquity = latestMetric(data, [/^total equity a\/t to holding company$/i], {
    tabs: ["balance"],
  });
  const currentAssets = latestMetric(data, [/^total current assets$/i], { tabs: ["balance"] });
  const currentLiabilities = latestMetric(data, [/^total current liabilities$/i], {
    tabs: ["balance"],
  });
  const tradeDebts = latestMetric(data, [/^trade debts$/i], { tabs: ["balance"] });
  const depreciation = latestMetric(data, [/^depreciation & amortisation$/i], {
    tabs: ["income", "cashflow"],
  });
  const ebit = operatingProfit;
  const ebitda = ebit != null ? ebit + Math.max(depreciation ?? 0, 0) : null;
  const capitalEmployed =
    totalEquity != null && totalDebt != null
      ? totalEquity + totalDebt - cash - shortTermInvestments
      : null;
  const netDebt = totalDebt != null ? totalDebt - cash - shortTermInvestments : null;
  const financialCharges = latestMetric(data, [/^financial charges$/i], { tabs: ["income", "latest"] });
  const cashNetIncome = firstNonNull(
    latestMetric(data, [/^net income$/i], { tabs: ["cashflow"] }),
    profitAfterTax
  );

  return {
    "roce": firstNonNull(
      latestMetric(data, [/^roce$/i], { tabs: ["ratios"] }),
      percentage(ebit, capitalEmployed)
    ),
    "roe": firstNonNull(base.roe, percentage(profitAfterTax, holdingEquity ?? totalEquity)),
    "operating-margin": firstNonNull(
      latestMetric(data, [/^operating margin$/i], { tabs: ["ratios"] }),
      percentage(operatingProfit, revenue)
    ),
    "net-margin": firstNonNull(base.netMargin, percentage(profitAfterTax, revenue)),
    "cfo-to-net-income": ratio(operatingCashFlow, cashNetIncome),
    "fcf-yield": percentage(
      operatingCashFlow != null && capex != null ? operatingCashFlow - Math.abs(capex) : null,
      base.marketCap
    ),
    "net-debt-to-ebitda": ratio(netDebt, ebitda),
    "interest-coverage": firstNonNull(
      latestMetric(data, [/^ebit \/ interest$/i], { tabs: ["ratios"] }),
      ratio(ebit, financialCharges != null ? Math.abs(financialCharges) : null)
    ),
    "pe-ratio": base.pe,
    "ev-to-ebitda": firstNonNull(
      latestMetric(data, [/^ev\/ebitda$/i], { tabs: ["ratios"] }),
      ratio(
        base.marketCap != null && totalDebt != null
          ? base.marketCap + totalDebt - cash - shortTermInvestments
          : null,
        ebitda
      )
    ),
    "gross-margin": firstNonNull(
      latestMetric(data, [/^gross margin$/i], { tabs: ["ratios"] }),
      percentage(grossProfit, revenue)
    ),
    "debt-to-equity": base.debtToEquity,
    "current-ratio": firstNonNull(
      latestMetric(data, [/^current ratio$/i], { tabs: ["ratios"] }),
      ratio(currentAssets, currentLiabilities)
    ),
    "receivable-days": tradeDebts != null && revenue != null && revenue > 0 ? (tradeDebts / revenue) * 365 : null,
    "pb-ratio": base.pbv,
    "dividend-yield": base.dividendYield,
  };
}

function collectFactorSources(raw: Record<AnalyzerFactorId, number | null>) {
  const sources: Record<AnalyzerFactorId, string> = {
    "roce": raw["roce"] != null ? "Ratios archive or annual EBIT formula" : "Unavailable",
    "roe": raw["roe"] != null ? "Ratios archive or equity formula" : "Unavailable",
    "operating-margin":
      raw["operating-margin"] != null ? "Ratios archive or operating profit formula" : "Unavailable",
    "net-margin":
      raw["net-margin"] != null ? "Ratios archive or profit formula" : "Unavailable",
    "cfo-to-net-income":
      raw["cfo-to-net-income"] != null ? "Annual cash flow vs profit" : "Unavailable",
    "fcf-yield": raw["fcf-yield"] != null ? "Free cash flow vs market cap" : "Unavailable",
    "net-debt-to-ebitda":
      raw["net-debt-to-ebitda"] != null ? "Debt, cash and EBITDA formula" : "Unavailable",
    "interest-coverage":
      raw["interest-coverage"] != null ? "Ratios archive or EBIT vs interest" : "Unavailable",
    "pe-ratio": raw["pe-ratio"] != null ? "Market value vs EPS" : "Unavailable",
    "ev-to-ebitda": raw["ev-to-ebitda"] != null ? "Ratios archive or EV formula" : "Unavailable",
    "gross-margin":
      raw["gross-margin"] != null ? "Ratios archive or gross profit formula" : "Unavailable",
    "debt-to-equity":
      raw["debt-to-equity"] != null ? "Ratios archive or debt vs equity formula" : "Unavailable",
    "current-ratio":
      raw["current-ratio"] != null ? "Ratios archive or current assets formula" : "Unavailable",
    "receivable-days":
      raw["receivable-days"] != null ? "Trade debts divided by annual sales" : "Unavailable",
    "pb-ratio": raw["pb-ratio"] != null ? "Market value vs book value" : "Unavailable",
    "dividend-yield":
      raw["dividend-yield"] != null ? "Ratios archive or DPS divided by market price" : "Unavailable",
  };
  return sources;
}

function buildFactor(
  definition: FactorDefinition,
  raw: Record<AnalyzerFactorId, number | null>,
  sources: Record<AnalyzerFactorId, string>
): AnalyzerFactor {
  const value = raw[definition.id];
  const scoreOutOf10 = scoreFactor(definition.id, value, raw);
  const score = scoreOutOf10 * 10;
  const status = value == null ? "missing" : gradeScore(scoreOutOf10);
  return {
    ...definition,
    categoryLabel: CATEGORY_LABELS[definition.categoryId],
    value,
    displayValue: formatFactorValue(value, definition.format),
    scoreOutOf10,
    score,
    status,
    sourceLabel: sources[definition.id],
    explanation: buildFactorExplanation(definition, value, status, raw),
  };
}

function buildCategoryScores(factors: AnalyzerFactor[]): AnalyzerCategoryScore[] {
  return (Object.keys(CATEGORY_LABELS) as AnalyzerFactorCategoryId[]).map((id) => {
    const subset = factors.filter((factor) => factor.categoryId === id && factor.status !== "missing");
    const score = subset.length
      ? Math.round(
          (subset.reduce((sum, factor) => sum + factor.scoreOutOf10, 0) / subset.length) * 10
        )
      : 0;
    const label = CATEGORY_LABELS[id];
    const summary =
      score >= 75
        ? `${label} is a clear strength right now.`
        : score >= 60
          ? `${label} is healthy, with a few points to monitor.`
          : score >= 45
            ? `${label} is mixed and needs a closer look.`
            : `${label} is the weaker side of this business right now.`;

    return {
      id,
      label,
      score,
      available: subset.length,
      summary,
    };
  });
}

function buildFactorExplanation(
  definition: FactorDefinition,
  value: number | null,
  status: AnalyzerFactorStatus,
  raw: Record<AnalyzerFactorId, number | null>
) {
  if (value == null) {
    return `${definition.label} is not available in the current cached snapshot, so this factor is not deciding the score yet.`;
  }

  const intro =
    status === "strong"
      ? "This is a clear positive."
      : status === "good"
        ? "This looks healthy."
        : status === "mixed"
          ? "This is usable, but not exciting."
          : "This is a weak reading.";

  switch (definition.id) {
    case "roce":
      return `${intro} The business is generating ${formatFactorValue(value, "percent")} on capital employed, which tells us how efficiently management is using operating capital.`;
    case "roe":
      return raw["debt-to-equity"] != null && raw["debt-to-equity"] > 1.5
        ? `${intro} ROE is ${formatFactorValue(value, "percent")}, but leverage is also elevated at ${formatFactorValue(raw["debt-to-equity"], "multiple")}, so part of the return may be debt-driven.`
        : `${intro} ROE is ${formatFactorValue(value, "percent")}, so shareholders are getting a reasonable return on equity.`;
    case "operating-margin":
      return `${intro} After direct operating costs and core expenses, the company is keeping ${formatFactorValue(value, "percent")} of sales as operating profit.`;
    case "net-margin":
      return `${intro} After finance costs and tax, the company is keeping ${formatFactorValue(value, "percent")} of sales as bottom-line profit.`;
    case "cfo-to-net-income":
      return value >= 1
        ? `${intro} Cash generation is backing the earnings. For every 1 rupee of profit, the business produced about ${formatFactorValue(value, "multiple")} of operating cash flow.`
        : `${intro} Cash conversion is softer than earnings. The company produced only ${formatFactorValue(value, "multiple")} of operating cash flow for each 1 rupee of profit.`;
    case "fcf-yield":
      return `${intro} Free cash flow yield is ${formatFactorValue(value, "percent")}, which shows how much cash the business is producing compared with its market value.`;
    case "net-debt-to-ebitda":
      return value <= 0
        ? `${intro} Net debt is below cash-adjusted operating earnings, which means the business is carrying net cash or very light debt pressure.`
        : `${intro} Net debt sits at ${formatFactorValue(value, "multiple")} of EBITDA. Lower is safer because it usually means easier debt servicing.`;
    case "interest-coverage":
      return `${intro} EBIT covers finance cost by about ${formatFactorValue(value, "multiple")}, which tells us how comfortably the company can carry its interest bill.`;
    case "pe-ratio":
      return `${intro} The market is pricing this stock at ${formatFactorValue(value, "multiple")} earnings. A lower P/E is only attractive when the rest of the business quality is decent.`;
    case "ev-to-ebitda":
      return `${intro} Enterprise value is ${formatFactorValue(value, "multiple")} EBITDA. This is a cleaner valuation check because it looks at debt as well as equity.`;
    case "gross-margin":
      return `${intro} The company is keeping ${formatFactorValue(value, "percent")} of sales after cost of goods sold, which shows its basic pricing power.`;
    case "debt-to-equity":
      return `${intro} Debt equals ${formatFactorValue(value, "multiple")} of equity. Lower leverage usually gives the business more room when markets turn weak.`;
    case "current-ratio":
      return `${intro} Current assets cover short-term liabilities by ${formatFactorValue(value, "multiple")}. Values above 1.0x are usually safer.`;
    case "receivable-days":
      return `${intro} It takes roughly ${formatFactorValue(value, "days")} to turn receivables into cash. Lower collection days are usually healthier.`;
    case "pb-ratio":
      return `${intro} The stock trades at ${formatFactorValue(value, "multiple")} book value. A lower P/B looks better when returns and margins are also healthy.`;
    case "dividend-yield":
      return `${intro} Dividend yield is ${formatFactorValue(value, "percent")}, which shows how much cash income the stock is paying relative to the current market price.`;
  }
}

function buildComparisonNote(
  definition: FactorDefinition,
  firstSymbol: string,
  secondSymbol: string,
  firstValue: string,
  secondValue: string,
  winner: "first" | "second" | "tie"
) {
  if (winner === "tie") {
    return `${definition.label} is too close to call right now. ${firstSymbol} is at ${firstValue} and ${secondSymbol} is at ${secondValue}.`;
  }
  const leader = winner === "first" ? firstSymbol : secondSymbol;
  switch (definition.id) {
    case "pe-ratio":
      return `${leader} looks cheaper on earnings. ${firstSymbol}: ${firstValue}. ${secondSymbol}: ${secondValue}.`;
    case "ev-to-ebitda":
      return `${leader} looks cheaper after accounting for debt as well as operating earnings. ${firstSymbol}: ${firstValue}. ${secondSymbol}: ${secondValue}.`;
    case "pb-ratio":
      return `${leader} is trading closer to book value. ${firstSymbol}: ${firstValue}. ${secondSymbol}: ${secondValue}.`;
    case "roce":
      return `${leader} is using operating capital more efficiently. ${firstSymbol}: ${firstValue}. ${secondSymbol}: ${secondValue}.`;
    case "roe":
      return `${leader} is generating a stronger return for shareholders. ${firstSymbol}: ${firstValue}. ${secondSymbol}: ${secondValue}.`;
    case "gross-margin":
      return `${leader} keeps more after direct production costs. ${firstSymbol}: ${firstValue}. ${secondSymbol}: ${secondValue}.`;
    case "operating-margin":
      return `${leader} keeps more from core operations. ${firstSymbol}: ${firstValue}. ${secondSymbol}: ${secondValue}.`;
    case "net-margin":
      return `${leader} converts more revenue into final profit. ${firstSymbol}: ${firstValue}. ${secondSymbol}: ${secondValue}.`;
    case "cfo-to-net-income":
      return `${leader} is turning accounting profit into cash more cleanly. ${firstSymbol}: ${firstValue}. ${secondSymbol}: ${secondValue}.`;
    case "fcf-yield":
      return `${leader} is producing more free cash flow relative to its market price. ${firstSymbol}: ${firstValue}. ${secondSymbol}: ${secondValue}.`;
    case "net-debt-to-ebitda":
      return `${leader} is carrying lighter debt pressure against operating earnings. ${firstSymbol}: ${firstValue}. ${secondSymbol}: ${secondValue}.`;
    case "interest-coverage":
      return `${leader} can cover finance costs more comfortably. ${firstSymbol}: ${firstValue}. ${secondSymbol}: ${secondValue}.`;
    case "debt-to-equity":
      return `${leader} relies less on borrowing compared with shareholder equity. ${firstSymbol}: ${firstValue}. ${secondSymbol}: ${secondValue}.`;
    case "current-ratio":
      return `${leader} has the safer short-term liquidity cushion. ${firstSymbol}: ${firstValue}. ${secondSymbol}: ${secondValue}.`;
    case "receivable-days":
      return `${leader} is collecting cash from customers faster. ${firstSymbol}: ${firstValue}. ${secondSymbol}: ${secondValue}.`;
    case "dividend-yield":
      return `${leader} is offering the stronger cash income yield at the current market price. ${firstSymbol}: ${firstValue}. ${secondSymbol}: ${secondValue}.`;
  }
}

function scoreFactor(
  id: AnalyzerFactorId,
  value: number | null,
  raw: Record<AnalyzerFactorId, number | null>
) {
  if (value == null) return 0;

  const qualitySupport =
    (raw["roce"] != null && raw["roce"] >= 15 ? 1 : 0) +
    (raw["roe"] != null && raw["roe"] >= 15 ? 1 : 0) +
    (raw["net-margin"] != null && raw["net-margin"] >= 10 ? 1 : 0) +
    (raw["cfo-to-net-income"] != null && raw["cfo-to-net-income"] >= 1 ? 1 : 0);
  const qualityStrong = qualitySupport >= 2;

  switch (id) {
    case "roce":
      return scoreHigher(value, [20, 15, 10, 5, 0]);
    case "roe": {
      const score = scoreHigher(value, [25, 18, 12, 8, 0]);
      const debtPenalty = raw["debt-to-equity"] != null && raw["debt-to-equity"] > 1.5 ? 2 : 0;
      return clamp10(score - debtPenalty);
    }
    case "operating-margin":
      return scoreHigher(value, [20, 15, 10, 5, 0]);
    case "net-margin":
      return scoreHigher(value, [15, 10, 7, 3, 0]);
    case "cfo-to-net-income":
      return scoreHigher(value, [1.2, 1, 0.8, 0.6, 0.2]);
    case "fcf-yield":
      return scoreHigher(value, [10, 7, 4, 1, 0]);
    case "net-debt-to-ebitda":
      return scoreLower(value, [0, 1.5, 3, 4, 5]);
    case "interest-coverage":
      return scoreHigher(value, [8, 5, 3, 2, 1]);
    case "pe-ratio": {
      const score = scoreLower(value, [8, 12, 16, 22, 30]);
      return clamp10(score - (qualityStrong ? 0 : 2));
    }
    case "ev-to-ebitda":
      return scoreLower(value, [4, 6, 8, 10, 12]);
    case "gross-margin":
      return scoreHigher(value, [30, 22, 15, 10, 0]);
    case "debt-to-equity":
      return scoreLower(value, [0.3, 0.6, 1, 1.5, 2]);
    case "current-ratio":
      return scoreHigher(value, [2, 1.5, 1.2, 1, 0.8]);
    case "receivable-days":
      return scoreLower(value, [30, 60, 90, 120, 180]);
    case "pb-ratio": {
      const score = scoreLower(value, [1.2, 1.8, 2.5, 3.5, 5]);
      return clamp10(score - (qualityStrong ? 0 : 2));
    }
    case "dividend-yield":
      return scoreHigher(value, [8, 5, 3, 1, 0]);
  }
}

function computeRoe(data: StockFinancialsData) {
  const profit = firstNonNull(
    latestMetric(data, [/profit after tax a\/t company owners/i], { tabs: ["income", "latest"] }),
    latestMetric(data, [/^profit after tax$/i], { tabs: ["income", "latest"] })
  );
  const equity =
    latestMetric(data, [/^total equity a\/t to holding company$/i], { tabs: ["balance"] }) ??
    latestMetric(data, [/^total equity$/i], { tabs: ["balance"] });
  return percentage(profit, equity);
}

function computeMargin(data: StockFinancialsData, kind: "net" | "operating" | "gross") {
  const sales = latestMetric(data, [/^net sales$/i], { tabs: ["income", "latest"] });
  const numerator =
    kind === "net"
      ? firstNonNull(
          latestMetric(data, [/profit after tax a\/t company owners/i], { tabs: ["income", "latest"] }),
          latestMetric(data, [/^profit after tax$/i], { tabs: ["income", "latest"] })
        )
      : kind === "operating"
        ? latestMetric(data, [/^operating profit$/i], { tabs: ["income", "latest"] })
        : latestMetric(data, [/^gross profit$/i], { tabs: ["income", "latest"] });
  return percentage(numerator, sales);
}

function computeDebtToEquity(data: StockFinancialsData) {
  const direct = latestMetric(data, [/^debt to equity$/i], { tabs: ["ratios"] });
  if (direct != null) {
    return direct > 5 ? direct / 100 : direct;
  }

  const shortTermDebt = latestMetric(data, [/^short-term debt$/i], { tabs: ["balance"] });
  const currentPortion = latestMetric(data, [/^current portion of long-term debt$/i], {
    tabs: ["balance"],
  });
  const longTermDebt = latestMetric(data, [/^long-term debt$/i], { tabs: ["balance"] });
  const totalDebt = sumNullable(shortTermDebt, currentPortion, longTermDebt);
  const totalEquity = latestMetric(data, [/^total equity$/i], { tabs: ["balance"] });
  return ratio(totalDebt, totalEquity);
}

function buildFreeCashFlowSeries(data: StockFinancialsData) {
  const operatingCashFlow = annualSeries(data, ["cashflow"], [/^operating cash flow$/i], 10);
  const capex = annualSeries(data, ["cashflow"], [/^capex$/i], 10);
  const capexMap = new Map(capex.map((point) => [point.period, point.value]));

  const combined = operatingCashFlow
    .map((point) => {
      const capexValue = capexMap.get(point.period);
      if (capexValue == null) return null;
      return {
        period: point.period,
        value: point.value - Math.abs(capexValue),
      };
    })
    .filter((point): point is MetricPoint => point != null);

  if (combined.length) return combined;
  return annualSeries(data, ["cashflow"], [/^fcff$/i], 10);
}

function annualSeries(
  data: StockFinancialsData,
  tabs: StockFinancialTabId[],
  patterns: RegExp[],
  maxPoints = 10
) {
  const row = findRowInTabs(data, tabs, patterns);
  if (!row) return [];
  return Object.entries(row.values)
    .filter(([period]) => isAnnualPeriod(period))
    .map(([period, raw]) => ({ period, value: parseNumber(raw) }))
    .filter((point): point is MetricPoint => point.value != null)
    .sort((left, right) => periodSortValue(left.period) - periodSortValue(right.period))
    .slice(-maxPoints);
}

function latestHighlightValue(data: StockFinancialsData, pattern: RegExp) {
  const highlight = data.tabs.overview?.highlights?.find((item) => pattern.test(item.label));
  return highlight ? parseMetricValue(highlight) : null;
}

function parseMetricValue(metric: FinancialMetric) {
  const match = metric.value.match(/-?\d[\d,]*(?:\.\d+)?/);
  return match ? parseNumber(match[0]) : null;
}

function findRowInTabs(
  data: StockFinancialsData,
  tabs: StockFinancialTabId[],
  patterns: RegExp[]
) {
  const matches: Array<{ row: FinancialTableRow; index: number; numericCount: number }> = [];

  tabs.forEach((tabId, index) => {
    for (const table of data.tabs[tabId]?.tables ?? []) {
      for (const row of table.rows) {
        if (row.isSection) continue;
        if (!patterns.some((pattern) => pattern.test(row.label))) continue;
        const numericCount = Object.values(row.values).reduce<number>(
          (count, raw) => (parseNumber(raw) != null ? count + 1 : count),
          0
        );
        matches.push({ row, index, numericCount });
      }
    }
  });

  if (!matches.length) return null;
  matches.sort((left, right) => {
    if (right.numericCount !== left.numericCount) return right.numericCount - left.numericCount;
    return left.index - right.index;
  });
  return matches[0]?.row ?? null;
}

function ratio(numerator: number | null, denominator: number | null) {
  if (numerator == null || denominator == null || denominator === 0) return null;
  return numerator / denominator;
}

function percentage(numerator: number | null, denominator: number | null) {
  if (numerator == null || denominator == null || denominator === 0) return null;
  return (numerator / denominator) * 100;
}

function sumNullable(...values: Array<number | null>) {
  const valid = values.filter((value): value is number => value != null);
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) : null;
}

function scoreHigher(value: number, thresholds: number[]) {
  if (value >= thresholds[0]) return 10;
  if (value >= thresholds[1]) return 8;
  if (value >= thresholds[2]) return 6;
  if (value >= thresholds[3]) return 4;
  if (value > thresholds[4]) return 2;
  return 0;
}

function scoreLower(value: number, thresholds: number[]) {
  if (value <= thresholds[0]) return 10;
  if (value <= thresholds[1]) return 8;
  if (value <= thresholds[2]) return 6;
  if (value <= thresholds[3]) return 4;
  if (value <= thresholds[4]) return 2;
  return 0;
}

function gradeScore(score: number): AnalyzerFactorStatus {
  if (score >= 9) return "strong";
  if (score >= 7) return "good";
  if (score >= 4) return "mixed";
  return "weak";
}

function decideWinner(
  first: number | null,
  second: number | null,
  direction: AnalyzerFactorDirection
) {
  if (first == null || second == null) return "tie";
  if (isCloseEnough(first, second)) return "tie";
  if (direction === "higher") return first > second ? "first" : "second";
  return first < second ? "first" : "second";
}

function isCloseEnough(first: number, second: number) {
  const diff = Math.abs(first - second);
  const scale = Math.max(Math.abs(first), Math.abs(second), 1);
  return diff / scale <= 0.03;
}

function buildHeadToHeadScores(
  first: number | null,
  second: number | null,
  direction: AnalyzerFactorDirection
) {
  if (first == null || second == null) {
    return { first: 50, second: 50 };
  }

  if (isCloseEnough(first, second)) {
    return { first: 50, second: 50 };
  }

  const reference = Math.max((Math.abs(first) + Math.abs(second)) / 2, 1);
  const normalizedGap = Math.abs(first - second) / reference;

  if (!Number.isFinite(normalizedGap) || normalizedGap <= 0) {
    return { first: 50, second: 50 };
  }

  const delta = clamp(Math.log1p(normalizedGap) * 24, 2, 28);
  const firstBetter = direction === "higher" ? first > second : first < second;

  return firstBetter
    ? {
        first: Math.round(50 + delta),
        second: Math.round(50 - delta),
      }
    : {
        first: Math.round(50 - delta),
        second: Math.round(50 + delta),
      };
}

function formatFactorValue(value: number | null, format: AnalyzerFactorFormat) {
  if (value == null) return "N/A";
  if (format === "percent") return `${round(value)}%`;
  if (format === "multiple") return `${round(value)}x`;
  if (format === "days") return `${round(value)} days`;
  if (format === "currency") return `Rs ${formatNumber(value)}`;
  return formatNumber(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: Math.abs(value) >= 100 ? 0 : 2,
    minimumFractionDigits: Math.abs(value) < 10 ? 2 : 0,
  }).format(value);
}

function round(value: number) {
  return Math.abs(value) >= 100 ? formatNumber(Math.round(value)) : formatNumber(Number(value.toFixed(2)));
}

function periodSortValue(period: string) {
  const year = Number(period);
  if (Number.isFinite(year)) return year * 10;
  const quarterMatch = period.match(/(\d)Q[A-Z]+(\d{2,4})/i);
  if (quarterMatch) {
    const yearValue = normalizeYear(quarterMatch[2]);
    return yearValue * 10 + Number(quarterMatch[1]);
  }
  const yearMatch = period.match(/(\d{4})/);
  if (yearMatch) return Number(yearMatch[1]) * 10;
  return Number.MAX_SAFE_INTEGER;
}

function normalizeYear(text: string) {
  return text.length === 2 ? 2000 + Number(text) : Number(text);
}

function isAnnualPeriod(period: string) {
  return /^\d{4}$/.test(period.trim());
}

function firstNonNull<T>(...values: Array<T | null | undefined>) {
  for (const value of values) {
    if (value != null) return value;
  }
  return null;
}

function clamp10(value: number) {
  return Math.max(0, Math.min(10, value));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
