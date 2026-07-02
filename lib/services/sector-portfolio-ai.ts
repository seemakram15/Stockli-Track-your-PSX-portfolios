import "server-only";

import { z } from "zod";
import {
  buildDeterministicPortfolioSuggestionInsight,
  buildDeterministicSectorLeadersInsight,
} from "@/lib/analysis/sector-portfolio-ai";
import {
  STOCK_ANALYZER_AI_MODELS,
  type StockAnalyzerAiModel,
} from "@/lib/analysis/stock-analyzer-ai";
import { getStaleCached } from "@/lib/cache/stale";
import { config, isZaiConfigured } from "@/lib/config";
import { getPortfolioSuggestion } from "@/lib/services/portfolio-suggestions";
import { getSectorLeadersData } from "@/lib/services/sector-leaders";

const AI_TTL_SECONDS = 6 * 60 * 60;
const AI_STALE_SECONDS = 24 * 60 * 60;
const AI_REQUEST_TIMEOUT_MS = 15_000;
const AI_REFRESH_ERROR_MESSAGE =
  "We could not refresh the AI summary right now. Please try again in a few minutes.";

export class StrategyAiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "StrategyAiError";
    this.statusCode = statusCode;
  }
}

const sectorInsightSchema = z.object({
  headline: z.string().min(1).max(180),
  summary: z.string().min(1).max(900),
  winnerCalls: z.array(z.string().min(1).max(240)).min(1).max(5),
  trends: z.array(z.string().min(1).max(220)).min(1).max(5),
  watchouts: z.array(z.string().min(1).max(220)).min(1).max(4),
  suggestion: z.string().min(1).max(420),
  confidence: z.enum(["high", "medium", "low"]),
});

const portfolioInsightSchema = z.object({
  headline: z.string().min(1).max(180),
  summary: z.string().min(1).max(900),
  portfolioFit: z.array(z.string().min(1).max(220)).min(1).max(5),
  holdingCalls: z
    .array(
      z.object({
        symbol: z.string().min(1).max(20),
        note: z.string().min(1).max(280),
      })
    )
    .min(1)
    .max(8),
  watchouts: z.array(z.string().min(1).max(220)).min(1).max(4),
  suggestion: z.string().min(1).max(420),
  confidence: z.enum(["high", "medium", "low"]),
});

export async function getSectorLeadersAiInsight({
  sectorKey,
  model,
}: {
  sectorKey: string;
  model?: StockAnalyzerAiModel;
}) {
  const sectorData = await getSectorLeadersData();
  const leaderboard =
    sectorData.value.leaderboards.find((board) => board.key === sectorKey) ?? null;
  if (!leaderboard) {
    throw new StrategyAiError("Sector leaderboard is unavailable right now.", 404);
  }

  const deterministic = buildDeterministicSectorLeadersInsight(leaderboard);
  return getStaleCached({
    key: `public:sector-leaders:ai:v2:auto:${sectorKey}:${leaderboard.updatedAt}`,
    ttlSeconds: AI_TTL_SECONDS,
    staleSeconds: AI_STALE_SECONDS,
    load: async () => ({
      sectorKey,
      deterministic,
      insight: await callZaiJsonWithFallback({
        preferredModel: model,
        schema: sectorInsightSchema,
        system:
          "You are Stockli's sector-ranking analyst for the Pakistan Stock Exchange. Only use the supplied numbers. Explain in plain English. Never output markdown.",
        prompt: {
          sector: leaderboard.sector,
          ruleName: leaderboard.ruleName,
          averageScore: leaderboard.averageScore,
          stockCount: leaderboard.stockCount,
          categories: leaderboard.categories,
          topStocks: leaderboard.stocks.slice(0, 8).map((stock) => ({
            symbol: stock.symbol,
            name: stock.name,
            score: stock.totalScore,
            analyzerScore: stock.analyzerScore,
            strongestMetrics: stock.strongestMetrics,
            weakestMetrics: stock.weakestMetrics,
            currentPrice: stock.currentPrice,
            changePct: stock.changePct,
            priceReturn1Y: stock.priceReturn1Y,
          })),
          deterministic,
        },
      }),
      generatedAt: new Date().toISOString(),
    }),
    isUsable: (value) => Boolean(value?.insight?.summary),
  });
}

export async function getPortfolioSuggestionAiInsight({
  duration,
  objective,
  holdings,
  model,
}: {
  duration: Parameters<typeof getPortfolioSuggestion>[0]["duration"];
  objective: Parameters<typeof getPortfolioSuggestion>[0]["objective"];
  holdings: number;
  model?: StockAnalyzerAiModel;
}) {
  const portfolio = await getPortfolioSuggestion({ duration, objective, holdings });
  const deterministic = buildDeterministicPortfolioSuggestionInsight(portfolio.value);

  return getStaleCached({
    key: `public:portfolio-suggestions:ai:v5:auto:${duration}:${objective}:${portfolio.value.holdingsRequested}:${portfolio.value.generatedAt}`,
    ttlSeconds: AI_TTL_SECONDS,
    staleSeconds: AI_STALE_SECONDS,
    load: async () => ({
      duration,
      objective,
      holdings: portfolio.value.holdingsRequested,
      deterministic,
      insight: await callZaiJsonWithFallback({
        preferredModel: model,
        schema: portfolioInsightSchema,
        system:
          "You are Stockli's portfolio suggestion analyst for the Pakistan Stock Exchange. Stay grounded in the supplied facts. Use plain language. Prefer durable, fundamentally strong companies. Favor blue-chip anchors plus credible growth names from healthier sectors. Avoid recommending stocks that only look strong because of recent price movement when the multi-year fundamentals are weak. Never output markdown.",
        prompt: {
          duration,
          objective,
          score: portfolio.value.score,
          expectedAnnualReturn: portfolio.value.expectedAnnualReturn,
          expectedRange: portfolio.value.expectedRange,
          sectorsCovered: portfolio.value.sectorsCovered,
          sectorMix: portfolio.value.sectorMix,
          holdings: portfolio.value.holdings.map((holding) => ({
            symbol: holding.symbol,
            name: holding.name,
            sector: holding.sector,
            portfolioRole: holding.portfolioRole,
            weight: holding.weight,
            score: holding.portfolioScore,
            expectedAnnualReturn: holding.expectedAnnualReturn,
            dividendYield: holding.dividendYield,
            reasons: holding.reasons,
          })),
          watchouts: portfolio.value.watchouts,
          deterministic,
        },
      }),
      generatedAt: new Date().toISOString(),
    }),
    isUsable: (value) => Boolean(value?.insight?.summary),
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
    throw new StrategyAiError(AI_REFRESH_ERROR_MESSAGE, 503);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

  const response = await fetch(`${config.ai.zaiBaseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.ai.zaiApiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(prompt) },
      ],
    }),
    signal: controller.signal,
  }).catch((error) => {
    if (error instanceof Error && error.name === "AbortError") {
      throw new StrategyAiError(AI_REFRESH_ERROR_MESSAGE, 504);
    }
    throw error;
  }).finally(() => {
    clearTimeout(timeoutId);
  });

  const payload = (await response.json().catch(() => null)) as
    | {
        error?: { message?: string };
        choices?: Array<{
          message?: {
            content?: string | Array<{ type?: string; text?: string }>;
          };
        }>;
      }
    | null;

  if (!response.ok) {
    const message = payload?.error?.message ?? `Z.AI request failed with status ${response.status}.`;
    throw new StrategyAiError(message, response.status);
  }

  const content = payload?.choices?.[0]?.message?.content;
  const text =
    typeof content === "string"
      ? content
      : Array.isArray(content)
        ? content
            .map((item) => item.text ?? "")
            .join("")
            .trim()
        : "";
  if (!text) {
    throw new StrategyAiError("AI did not return a usable response.", 502);
  }

  const parsed = schema.safeParse(JSON.parse(text));
  if (!parsed.success) {
    throw new StrategyAiError("AI returned an invalid response shape.", 502);
  }

  return parsed.data;
}

async function callZaiJsonWithFallback<T>({
  preferredModel,
  schema,
  system,
  prompt,
}: {
  preferredModel?: StockAnalyzerAiModel;
  schema: z.ZodSchema<T>;
  system: string;
  prompt: unknown;
}) {
  const attempts = buildModelAttempts(preferredModel);

  for (const model of attempts) {
    try {
      return await callZaiJson({ model, schema, system, prompt });
    } catch (error) {
      if (error instanceof StrategyAiError && error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
        continue;
      }
    }
  }

  throw new StrategyAiError(AI_REFRESH_ERROR_MESSAGE, 503);
}

function buildModelAttempts(preferredModel?: StockAnalyzerAiModel) {
  const attempts = preferredModel
    ? [preferredModel, ...STOCK_ANALYZER_AI_MODELS.filter((model) => model !== preferredModel)]
    : [...STOCK_ANALYZER_AI_MODELS];
  return [...new Set(attempts)];
}
