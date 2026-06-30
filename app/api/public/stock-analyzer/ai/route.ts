import { NextResponse } from "next/server";
import { z } from "zod";
import { STOCK_ANALYZER_AI_MODELS } from "@/lib/analysis/stock-analyzer-ai";
import { normalizeSymbol } from "@/lib/security/validation";
import {
  getStockAnalyzeAiInsight,
  getStockCompareAiInsight,
  StockAnalyzerAiError,
} from "@/lib/services/stock-analyzer-ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const analyzeSchema = z.object({
  mode: z.literal("analyze"),
  model: z.enum(STOCK_ANALYZER_AI_MODELS),
  symbol: z.string().min(1),
});

const compareSchema = z.object({
  mode: z.literal("compare"),
  model: z.enum(STOCK_ANALYZER_AI_MODELS),
  firstSymbol: z.string().min(1),
  secondSymbol: z.string().min(1),
});

const requestSchema = z.union([analyzeSchema, compareSchema]);

export async function POST(request: Request) {
  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid AI analyzer request." }, { status: 400 });
    }
    const input = parsed.data;

    if (input.mode === "analyze") {
      const symbol = normalizeSymbol(input.symbol);
      if (!symbol) {
        return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
      }

      const cached = await getStockAnalyzeAiInsight({ symbol, model: input.model });
      return NextResponse.json(
        {
          data: cached.value,
          cache: {
            status: cached.status,
            storedAt: cached.storedAt,
          },
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
          },
        }
      );
    }

    const firstSymbol = normalizeSymbol(input.firstSymbol);
    const secondSymbol = normalizeSymbol(input.secondSymbol);
    if (!firstSymbol || !secondSymbol || firstSymbol === secondSymbol) {
      return NextResponse.json({ error: "Choose two different valid symbols." }, { status: 400 });
    }

    const cached = await getStockCompareAiInsight({
      firstSymbol,
      secondSymbol,
      model: input.model,
    });
    return NextResponse.json(
      {
        data: cached.value,
        cache: {
          status: cached.status,
          storedAt: cached.storedAt,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI analyzer is unavailable right now.";
    const status =
      error instanceof StockAnalyzerAiError
        ? error.statusCode
        : /not configured/i.test(message)
          ? 503
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
