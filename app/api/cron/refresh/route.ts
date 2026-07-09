import { NextResponse } from "next/server";
import { isAuthorizedCronRequest } from "@/lib/auth/cron";
import { runBackendWarmup } from "@/lib/services/backend-warmup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/cron/refresh — secured scheduled market refresh.
 *
 * This route is intentionally lean because it is hit during live PSX windows
 * by the GitHub cron job. It refreshes the market snapshot, daily P/L, alerts,
 * and system notifications, but skips slower optional warmups that can push a
 * Vercel request over the 60-second execution window.
 */
export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runBackendWarmup({
    trigger: "cron",
    force: true,
    includePublicCaches: false,
    includeFundamentalsArchive: false,
  });
  return NextResponse.json(
    {
      ...result,
      cronMode: "market-live",
      optionalWarmupsSkipped:
        "Public cache warmups and fundamentals archive are handled outside the live PSX refresh path.",
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
