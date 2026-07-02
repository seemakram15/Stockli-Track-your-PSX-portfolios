import { NextRequest, NextResponse } from "next/server";
import { getSectorLeadersData } from "@/lib/services/sector-leaders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const sectorKey = request.nextUrl.searchParams.get("sector")?.trim() ?? "";
  const cached = await getSectorLeadersData();
  const leaderboard = sectorKey
    ? cached.value.leaderboards.find((board) => board.key === sectorKey) ?? null
    : null;

  return NextResponse.json(
    {
      data: sectorKey
        ? {
            updatedAt: cached.value.updatedAt,
            sectors: cached.value.sectors,
            leaderboard,
          }
        : cached.value,
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
