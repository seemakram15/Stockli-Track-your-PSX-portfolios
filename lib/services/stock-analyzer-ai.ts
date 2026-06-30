import "server-only";

import { z } from "zod";
import {
  buildAnalyzerSummary,
  type AnalyzerSummary,
  type MetricPoint,
} from "@/lib/analysis/stock-analyzer";
import {
  STOCK_ANALYZER_AI_MODELS,
  type StockAnalyzeAiInsight,
  type StockAnalyzerAiModel,
  type StockCompareAiInsight,
} from "@/lib/analysis/stock-analyzer-ai";
import { getStaleCached } from "@/lib/cache/stale";
import { config, isZaiConfigured } from "@/lib/config";
import { getStockFinancials } from "@/lib/services/stock-fundamentals";

const ANALYZE_TTL_SECONDS = 6 * 60 * 60;
const ANALYZE_STALE_SECONDS = 24 * 60 * 60;

export class StockAnalyzerAiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "StockAnalyzerAiError";
    this.statusCode = statusCode;
  }
}

const analyzeInsightSchema = z.object({
  headline: z.string().min(1).max(160),
  summary: z.string().min(1).max(800),
  strengths: z.array(z.string().min(1).max(220)).min(1).max(4),
  risks: z.array(z.string().min(1).max(220)).min(1).max(4),
  valuationView: z.string().min(1).max(240),
  dividendView: z.string().min(1).max(240),
  suggestion: z.string().min(1).max(400),
  confidence: z.enum(["high", "medium", "low"]),
});

const compareInsightSchema = z.object({
  winner: z.string().min(1).max(30),
  summary: z.string().min(1).max(900),
  whyWinner: z.array(z.string().min(1).max(220)).min(1).max(4),
  firstStrengths: z.array(z.string().min(1).max(220)).min(1).max(4),
  secondStrengths: z.array(z.string().min(1).max(220)).min(1).max(4),
  watchouts: z.array(z.string().min(1).max(220)).min(1).max(4),
  suggestion: z.string().min(1).max(420),
  confidence: z.enum(["high", "medium", "low"]),
});

type AnalyzeAiPayload = {
  mode: "analyze";
  model: StockAnalyzerAiModel;
  symbol: string;
  companyName: string;
  sourceUpdatedAt: string;
  insight: StockAnalyzeAiInsight;
  generatedAt: string;
};

type CompareAiPayload = {
  mode: "compare";
  model: StockAnalyzerAiModel;
  firstSymbol: string;
  secondSymbol: string;
  sourceUpdatedAt: [string, string];
  insight: StockCompareAiInsight;
  generatedAt: string;
};

export async function getStockAnalyzeAiInsight({
  symbol,
  model,
}: {
  symbol: string;
  model: StockAnalyzerAiModel;
}) {
  assertSupportedModel(model);
  const stock = await getStockFinancials(symbol);
  if (!stock) throw new Error(`Financial data unavailable for ${symbol}.`);

  const summary = buildAnalyzerSummary(stock.value, null);
  const cacheKey = [
    "public:stock-analyzer:ai:v1:analyze",
    model,
    summary.symbol,
    stock.value.updatedAt,
  ].join(":");

  const cached = await getStaleCached<AnalyzeAiPayload>({
    key: cacheKey,
    ttlSeconds: ANALYZE_TTL_SECONDS,
    staleSeconds: ANALYZE_STALE_SECONDS,
    load: async () => ({
      mode: "analyze",
      model,
      symbol: summary.symbol,
      companyName: summary.name,
      sourceUpdatedAt: stock.value.updatedAt,
      insight: await requestAnalyzeInsight(summary, model),
      generatedAt: new Date().toISOString(),
    }),
    isUsable: (value) => Boolean(value?.insight?.summary),
  });

  return cached;
}

export async function getStockCompareAiInsight({
  firstSymbol,
  secondSymbol,
  model,
}: {
  firstSymbol: string;
  secondSymbol: string;
  model: StockAnalyzerAiModel;
}) {
  assertSupportedModel(model);
  const [firstStock, secondStock] = await Promise.all([
    getStockFinancials(firstSymbol),
    getStockFinancials(secondSymbol),
  ]);

  if (!firstStock || !secondStock) {
    throw new Error("Comparison data is unavailable for one or both stocks.");
  }

  const first = buildAnalyzerSummary(firstStock.value, null);
  const second = buildAnalyzerSummary(secondStock.value, null);
  const cacheKey = [
    "public:stock-analyzer:ai:v1:compare",
    model,
    first.symbol,
    firstStock.value.updatedAt,
    second.symbol,
    secondStock.value.updatedAt,
  ].join(":");

  const cached = await getStaleCached<CompareAiPayload>({
    key: cacheKey,
    ttlSeconds: ANALYZE_TTL_SECONDS,
    staleSeconds: ANALYZE_STALE_SECONDS,
    load: async () => ({
      mode: "compare",
      model,
      firstSymbol: first.symbol,
      secondSymbol: second.symbol,
      sourceUpdatedAt: [firstStock.value.updatedAt, secondStock.value.updatedAt],
      insight: await requestCompareInsight(first, second, model),
      generatedAt: new Date().toISOString(),
    }),
    isUsable: (value) => Boolean(value?.insight?.summary),
  });

  return cached;
}

function assertSupportedModel(model: string): asserts model is StockAnalyzerAiModel {
  if (!STOCK_ANALYZER_AI_MODELS.includes(model as StockAnalyzerAiModel)) {
    throw new Error("Unsupported AI model.");
  }
}

async function requestAnalyzeInsight(summary: AnalyzerSummary, model: StockAnalyzerAiModel) {
  return callZaiJson({
    model,
    schema: analyzeInsightSchema,
    system:
      "You are Stockli's grounded stock analyzer for the Pakistan Stock Exchange. You explain only from the provided data. Do not mention hidden assumptions. Never output markdown.",
    prompt: buildAnalyzePrompt(summary),
  });
}

async function requestCompareInsight(
  first: AnalyzerSummary,
  second: AnalyzerSummary,
  model: StockAnalyzerAiModel
) {
  const comparisons = [
    compareMetric("Health score", first.healthScore, second.healthScore, "higher"),
    compareMetric("Risk score", first.riskScore, second.riskScore, "lower"),
    compareMetric("P/E ratio", first.pe, second.pe, "lower"),
    compareMetric("P/B ratio", first.pbv, second.pbv, "lower"),
    compareMetric("Dividend yield", first.dividendYield, second.dividendYield, "higher"),
    compareMetric("ROE", first.roe, second.roe, "higher"),
    compareMetric("Net margin", first.netMargin, second.netMargin, "higher"),
    compareMetric("Debt to equity", first.debtToEquity, second.debtToEquity, "lower"),
    compareMetric("Revenue growth", first.revenueGrowth, second.revenueGrowth, "higher"),
    compareMetric("EPS growth", first.epsGrowth, second.epsGrowth, "higher"),
  ];

  const firstWins = comparisons.filter((row) => row.winner === "first").length;
  const secondWins = comparisons.filter((row) => row.winner === "second").length;

  return callZaiJson({
    model,
    schema: compareInsightSchema,
    system:
      "You are Stockli's grounded stock comparison assistant for the Pakistan Stock Exchange. Explain the comparison clearly, but stay inside the supplied facts. Never output markdown.",
    prompt: buildComparePrompt(first, second, firstWins, secondWins, comparisons),
  });
}

async function callZaiJson<T>({
  model,
  schema,
  system,
  prompt,
}: {
  model: StockAnalyzerAiModel;
  schema: z.ZodSchema<T>;
  system: string;
  prompt: unknown;
}) {
  if (!isZaiConfigured) {
    throw new StockAnalyzerAiError(
      "Z.AI is not configured. Add ZAI_API_KEY to enable AI stock insights.",
      503
    );
  }

  const response = await fetch(`${config.ai.zaiBaseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.ai.zaiApiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(prompt) },
      ],
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | {
        error?: { code?: string; message?: string };
        choices?: Array<{
          message?: {
            content?: string | Array<{ type?: string; text?: string }>;
          };
        }>;
      }
    | null;

  if (!response.ok) {
    const message = payload?.error?.message ?? "Z.AI request failed.";
    if (payload?.error?.code === "1302" || /rate limit/i.test(message)) {
      throw new StockAnalyzerAiError(
        "GLM rate limit reached. Please retry shortly or switch the model.",
        429
      );
    }
    throw new StockAnalyzerAiError(message, response.status >= 400 ? response.status : 502);
  }

  const content = extractMessageContent(payload);
  const parsed = safeJsonParse(content);
  const normalized = sanitizeInsightPayload(normalizeInsightPayload(parsed));
  const result = schema.safeParse(normalized);
  if (!result.success) {
    throw new StockAnalyzerAiError(
      "GLM returned an incomplete response. Please retry for a cleaner explanation.",
      502
    );
  }
  return result.data;
}

function extractMessageContent(payload: {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
} | null) {
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    const text = content
      .map((item) => (typeof item?.text === "string" ? item.text : ""))
      .join("")
      .trim();
    if (text) return text;
  }
  throw new Error("Z.AI returned an empty response.");
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new StockAnalyzerAiError(
        "GLM did not return valid JSON. Please retry the explanation.",
        502
      );
    }
    return JSON.parse(match[0]);
  }
}

function buildAnalyzePrompt(summary: AnalyzerSummary) {
  return [
    "Return only a valid JSON object.",
    'Required keys: headline, summary, strengths, risks, valuationView, dividendView, suggestion, confidence.',
    'Set confidence to only one of: "high", "medium", "low".',
    "Use simple, meaningful English for a retail investor in Pakistan.",
    "Do not give absolute buy or sell guarantees.",
    "If data is mixed, say that clearly.",
    "Do not leave strengths or risks empty. If needed, mention data limitations.",
    "Grounded stock data:",
    JSON.stringify(serializeSummary(summary)),
  ].join("\n");
}

function buildComparePrompt(
  first: AnalyzerSummary,
  second: AnalyzerSummary,
  firstWins: number,
  secondWins: number,
  comparisons: Array<ReturnType<typeof compareMetric>>
) {
  return [
    "Return only a valid JSON object.",
    "Required keys: winner, summary, whyWinner, firstStrengths, secondStrengths, watchouts, suggestion, confidence.",
    'Set confidence to only one of: "high", "medium", "low".',
    'Set winner to one of: "' + first.symbol + '", "' + second.symbol + '", or "Balanced".',
    "Use simple, meaningful English for a retail investor in Pakistan.",
    "Do not invent sector stories or facts not present in the data.",
    "Do not leave any list empty. If needed, mention data limitations.",
    "First stock:",
    JSON.stringify(serializeSummary(first)),
    "Second stock:",
    JSON.stringify(serializeSummary(second)),
    "Deterministic scorecard:",
    JSON.stringify({
      first_symbol: first.symbol,
      second_symbol: second.symbol,
      first_wins: firstWins,
      second_wins: secondWins,
      comparisons,
    }),
  ].join("\n");
}

function normalizeInsightPayload(value: unknown) {
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;

  const strengths = coerceStringArray(
    record.strengths ?? record.pros ?? record.positives ?? record.key_strengths
  );
  const risks = coerceStringArray(
    record.risks ?? record.cons ?? record.concerns ?? record.watchouts ?? record.key_risks
  );

  if ("winner" in record || "whyWinner" in record || "firstStrengths" in record || "secondStrengths" in record) {
    return {
      winner: coerceString(record.winner) ?? coerceString(record.result) ?? "Balanced",
      summary:
        coerceString(record.summary) ??
        coerceString(record.overview) ??
        coerceString(record.comparison) ??
        "",
      whyWinner: coerceStringArray(
        record.whyWinner ?? record.why_winner ?? record.reasons ?? record.winnerReasons
      ),
      firstStrengths: coerceStringArray(
        record.firstStrengths ?? record.first_strengths ?? record.stockA ?? record.firstPros
      ),
      secondStrengths: coerceStringArray(
        record.secondStrengths ?? record.second_strengths ?? record.stockB ?? record.secondPros
      ),
      watchouts: coerceStringArray(
        record.watchouts ?? record.concerns ?? record.risks ?? record.sharedRisks
      ),
      suggestion:
        coerceString(record.suggestion) ??
        coerceString(record.recommendation) ??
        coerceString(record.finalSuggestion) ??
        "",
      confidence: coerceConfidence(record.confidence),
    };
  }

  return {
    headline:
      coerceString(record.headline) ??
      coerceString(record.title) ??
      coerceString(record.label) ??
      "",
    summary:
      coerceString(record.summary) ??
      coerceString(record.overview) ??
      coerceString(record.analysis) ??
      "",
    strengths,
    risks,
    valuationView:
      coerceString(record.valuationView) ??
      coerceString(record.valuation) ??
      coerceString(record.valuation_read) ??
      "",
    dividendView:
      coerceString(record.dividendView) ??
      coerceString(record.dividend) ??
      coerceString(record.dividend_read) ??
      "",
    suggestion:
      coerceString(record.suggestion) ??
      coerceString(record.recommendation) ??
      coerceString(record.finalSuggestion) ??
      "",
    confidence: coerceConfidence(record.confidence),
  };
}

function sanitizeInsightPayload(value: unknown) {
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;

  if ("winner" in record || "whyWinner" in record || "firstStrengths" in record || "secondStrengths" in record) {
    return {
      winner: limitText(record.winner, 30),
      summary: limitText(record.summary, 900),
      whyWinner: limitList(record.whyWinner, 4, 220),
      firstStrengths: limitList(record.firstStrengths, 4, 220),
      secondStrengths: limitList(record.secondStrengths, 4, 220),
      watchouts: limitList(record.watchouts, 4, 220),
      suggestion: limitText(record.suggestion, 420),
      confidence: coerceConfidence(record.confidence),
    };
  }

  return {
    headline: limitText(record.headline, 160),
    summary: limitText(record.summary, 800),
    strengths: limitList(record.strengths, 4, 220),
    risks: limitList(record.risks, 4, 220),
    valuationView: limitText(record.valuationView, 240),
    dividendView: limitText(record.dividendView, 240),
    suggestion: limitText(record.suggestion, 400),
    confidence: coerceConfidence(record.confidence),
  };
}

function coerceString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function coerceStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => coerceString(item))
      .filter((item): item is string => Boolean(item))
      .slice(0, 4);
  }
  const single = coerceString(value);
  return single ? [single] : [];
}

function coerceConfidence(value: unknown): "high" | "medium" | "low" {
  const text = coerceString(value)?.toLowerCase();
  if (text === "high" || text === "medium" || text === "low") return text;
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value >= 75) return "high";
    if (value >= 45) return "medium";
    return "low";
  }
  return "medium";
}

function limitText(value: unknown, max: number) {
  const text = coerceString(value) ?? "";
  return text.length <= max ? text : `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function limitList(value: unknown, maxItems: number, maxChars: number) {
  return coerceStringArray(value)
    .slice(0, maxItems)
    .map((item) => (item.length <= maxChars ? item : `${item.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`));
}

function serializeSummary(summary: AnalyzerSummary) {
  return {
    symbol: summary.symbol,
    name: summary.name,
    sector: summary.sector,
    deterministic_verdict: summary.verdict,
    scores: {
      health_score: summary.healthScore,
      risk_score: summary.riskScore,
      price_to_book_signal: summary.priceToBookSignal,
    },
    latest_metrics: {
      pe: summary.pe,
      pbv: summary.pbv,
      roe: summary.roe,
      net_margin: summary.netMargin,
      debt_to_equity: summary.debtToEquity,
      revenue_growth_pct: summary.revenueGrowth,
      eps_growth_pct: summary.epsGrowth,
      dividend_yield_pct: summary.dividendYield,
      payout_ratio_pct: summary.payoutRatio,
      eps: summary.eps,
      dps: summary.dps,
      book_value_per_share: summary.bookValue,
      market_cap: summary.marketCap,
    },
    revenue_trend: shrinkSeries(summary.revenue),
    profit_trend: shrinkSeries(summary.profit),
    eps_trend: shrinkSeries(summary.epsSeries),
    dividend_trend: shrinkSeries(summary.dpsSeries),
  };
}

function shrinkSeries(series: MetricPoint[]) {
  return series.slice(-4).map((point) => ({
    period: point.period,
    value: roundMetric(point.value),
  }));
}

function compareMetric(
  label: string,
  first: number | null,
  second: number | null,
  preferred: "higher" | "lower"
) {
  const winner =
    first == null || second == null || first === second
      ? "tie"
      : preferred === "higher"
        ? first > second
          ? "first"
          : "second"
        : first < second
          ? "first"
          : "second";

  return {
    label,
    preferred,
    first: roundMetric(first),
    second: roundMetric(second),
    winner,
  };
}

function roundMetric(value: number | null) {
  if (value == null) return null;
  return Math.round(value * 100) / 100;
}
