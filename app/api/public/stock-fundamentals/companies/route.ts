import { NextResponse } from "next/server";
import { getStockFundamentalsCompanies } from "@/lib/services/stock-fundamentals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const readyOnly = new URL(request.url).searchParams.get("ready") === "1";
  const companies = await getStockFundamentalsCompanies({ readyOnly });

  return NextResponse.json(
    { data: { companies } },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
