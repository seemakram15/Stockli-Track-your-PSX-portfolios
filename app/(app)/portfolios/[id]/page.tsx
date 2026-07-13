import type { Metadata } from "next";
import { getSessionUser } from "@/lib/services/portfolio";
import { isDemoMode } from "@/lib/config";
import { CachedPortfolioDetailPage } from "@/components/portfolio/cached-portfolio-detail-page";

export const dynamic = "force-dynamic";

// A static title here (instead of fetching the portfolio row) keeps this
// route's first response byte from blocking on a DB round-trip. The client
// component sets the real per-portfolio title via document.title once its
// own data load resolves — it needs that data anyway.
export const metadata: Metadata = { title: "Portfolio" };

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  return <CachedPortfolioDetailPage id={id} userId={user?.id ?? "anonymous"} demo={isDemoMode} />;
}
