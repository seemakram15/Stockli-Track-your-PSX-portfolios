import { NextRequest, NextResponse } from "next/server";
import {
  PORTFOLIO_DURATIONS,
  PORTFOLIO_OBJECTIVES,
  type PortfolioDuration,
  type PortfolioObjective,
} from "@/lib/analysis/portfolio-suggestions";
import { getPortfolioSuggestion } from "@/lib/services/portfolio-suggestions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const duration =
    (request.nextUrl.searchParams.get("duration") as PortfolioDuration | null) ?? "long-term";
  const objective =
    (request.nextUrl.searchParams.get("objective") as PortfolioObjective | null) ??
    "income-and-growth";
  const holdings = Number(request.nextUrl.searchParams.get("holdings") ?? "6");

  if (!PORTFOLIO_DURATIONS.includes(duration)) {
    return NextResponse.json({ error: "Unsupported duration." }, { status: 400 });
  }
  if (!PORTFOLIO_OBJECTIVES.includes(objective)) {
    return NextResponse.json({ error: "Unsupported objective." }, { status: 400 });
  }

  const cached = await getPortfolioSuggestion({ duration, objective, holdings });
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
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=86400",
      },
    }
  );
}
