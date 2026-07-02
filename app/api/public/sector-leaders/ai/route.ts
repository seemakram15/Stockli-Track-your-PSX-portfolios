import { NextResponse } from "next/server";
import { z } from "zod";
import { STOCK_ANALYZER_AI_MODELS } from "@/lib/analysis/stock-analyzer-ai";
import { isDemoMode } from "@/lib/config";
import { StrategyAiError, getSectorLeadersAiInsight } from "@/lib/services/sector-portfolio-ai";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const requestSchema = z.object({
  sectorKey: z.string().min(1),
  model: z.enum(STOCK_ANALYZER_AI_MODELS).optional(),
});

export async function POST(request: Request) {
  try {
    if (!isDemoMode) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid sector AI request." }, { status: 400 });
    }

    const cached = await getSectorLeadersAiInsight(parsed.data);
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
          "Cache-Control": "private, no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    const message =
      error instanceof StrategyAiError
        ? error.message
        : "We could not refresh the AI summary right now. Please try again in a few minutes.";
    const status = error instanceof StrategyAiError ? error.statusCode : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
