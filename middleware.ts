import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isAllowedPublicApiRequest } from "@/lib/security/api-guard";
import { edgeRateLimit } from "@/lib/security/edge-rate-limit";

// Public data routes: no session required but gated by origin + rate limit.
const PUBLIC_DATA_API_PREFIXES = ["/api/public/", "/api/search"];

// Rate-limited API paths — covers both public and the prices polling endpoint.
// Limits chosen so normal browsing never comes close:
//   prices: SWR polls every 30 s → ~2 req/min per tab; 20 is very generous
//   public: a heavy browsing session across all market pages → ~15 req/min
//   search: fast typers with debounce → ~10 req/min; 40 is very generous
const RATE_LIMITS: { prefix: string; scope: string; limit: number; window: number }[] = [
  { prefix: "/api/prices",  scope: "prices", limit: 20, window: 60 },
  { prefix: "/api/public/", scope: "public", limit: 80, window: 60 },
  { prefix: "/api/search",  scope: "search", limit: 40, window: 60 },
];

function tooManyRequests(retryAfter: number) {
  return NextResponse.json(
    { error: "Too many requests. Please slow down." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Reset": String(Math.floor(Date.now() / 1000) + retryAfter),
      },
    }
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Public data API routes (no auth, but origin-gated + rate limited) ────
  if (PUBLIC_DATA_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    if (!isAllowedPublicApiRequest(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const rule = RATE_LIMITS.find((r) => pathname.startsWith(r.prefix));
    if (rule) {
      const result = await edgeRateLimit(request, rule.scope, rule.limit, rule.window);
      if (!result.allowed) return tooManyRequests(result.retryAfter);
    }
    return NextResponse.next();
  }

  // ── Prices endpoint (used by authenticated pages for live polling) ─────────
  if (pathname.startsWith("/api/prices")) {
    const result = await edgeRateLimit(request, "prices", 20, 60);
    if (!result.allowed) return tooManyRequests(result.retryAfter);
    return NextResponse.next();
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
    "/api/public/:path*",
    "/api/search",
    "/api/prices",
  ],
};
