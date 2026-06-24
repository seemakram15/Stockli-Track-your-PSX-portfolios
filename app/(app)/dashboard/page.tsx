import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  CalendarClock,
} from "lucide-react";
import { getDashboard } from "@/lib/services/portfolio";
import { getIndexSummariesCached } from "@/lib/services/history";
import { getGlobalMarketData } from "@/lib/services/global-markets";
import { getPortfolioCalendar } from "@/lib/services/daily-pl";
import {
  PerformanceSection,
  PerformanceSkeleton,
} from "@/components/dashboard/performance-section";
import {
  AllocationExplorer,
  AllocationExpandDialog,
} from "@/components/dashboard/allocation-explorer";
import {
  IndexTickerStrip,
  type DashboardTickerItem,
} from "@/components/dashboard/index-ticker-strip";
import { marketStatus } from "@/lib/psx/market-hours";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { LiveSummaryCards } from "@/components/live-summary-cards";
import { PLCalendar } from "@/components/charts/pl-calendar";
import { EmptyState } from "@/components/empty-state";
import { MarketStatusBadge } from "@/components/status-badges";
import { formatPKR, formatPercent, plColorClass } from "@/lib/format";
import type { GlobalMarketQuote } from "@/lib/services/global-markets";
import type { HoldingWithMetrics, IndexSummary } from "@/lib/types";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [data, indexSummaries, oilMarket, commodityMarket] = await Promise.all([
    getDashboard(),
    getIndexSummariesCached().catch(() => []),
    getGlobalMarketData("oil").catch(() => null),
    getGlobalMarketData("commodities").catch(() => null),
  ]);
  const { summary, holdings, portfolios } = data;
  const { headlineTicker, tickerItems } = buildTickerStripItems(
    indexSummaries,
    oilMarket?.quotes ?? [],
    commodityMarket?.quotes ?? []
  );
  const performancePortfolios = portfolios
    .map((portfolio) => ({
      id: portfolio.id,
      name: portfolio.name,
      positions: holdings
        .filter((h) => h.portfolio_id === portfolio.id)
        .map((h) => ({ symbol: h.symbol, quantity: h.quantity })),
    }))
    .filter((portfolio) => portfolio.positions.length > 0);
  const calendar = holdings.length
    ? await getPortfolioCalendar(holdings, data.transactions)
    : null;
  const liveCalendarPositions = holdings.map((h) => ({
    symbol: h.symbol,
    quantity: h.quantity,
    initial: h.quote,
  }));
  const market = marketStatus();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Dashboard"
        description="Your positions across all portfolios, at a glance."
        actions={
          <>
            <MarketStatusBadge status={market.status} label={market.label} />
            <Button asChild size="sm">
              <Link href="/portfolios">
                <Plus className="size-4" /> Manage
              </Link>
            </Button>
          </>
        }
      />

      <IndexTickerStrip headline={headlineTicker} items={tickerItems} />

      {holdings.length === 0 ? (
        <EmptyState
          icon={<Wallet className="size-6" />}
          title="No holdings yet"
          description="Create a portfolio and add your first PSX position to see live P/L, charts and your daily gain/loss calendar."
          action={
            <Button asChild>
              <Link href="/portfolios">
                <Plus className="size-4" /> Create a portfolio
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          <LiveSummaryCards holdings={holdings} realizedPL={summary.realizedPL} />

          {/* Performance + Allocation */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Suspense fallback={<PerformanceSkeleton />}>
              <PerformanceSection portfolios={performancePortfolios} holdings={holdings} />
            </Suspense>
            <AllocationExplorer holdings={holdings} portfolios={portfolios} title="Allocation overview" />
          </div>

          {/* Movers */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <MoversCard title="Top performers" icon="up" items={data.topGainers} />
            <MoversCard title="Lagging positions" icon="down" items={data.topLosers} />
          </div>

          {/* All portfolios calendar */}
          <Card className="relative">
            <CardHeader className="flex-col items-start gap-2 pr-16 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-2">
                <CalendarClock className="mt-0.5 size-5 text-primary" />
                <div>
                  <CardTitle>All portfolios gain / loss calendar</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Daily PKR gain/loss across every portfolio, with today updated from live session prices.
                  </p>
                </div>
              </div>
              <AllocationExpandDialog
                holdings={holdings}
                portfolios={portfolios}
                description="Explore exposure, invested amount and live P/L across all portfolios."
                ariaLabel="Expand portfolio allocation"
                triggerClassName="absolute right-4 top-4 z-10 size-9 border-primary/30 bg-primary/5 text-primary shadow-sm hover:bg-primary/10"
              />
            </CardHeader>
            <CardContent>
              <PLCalendar
                data={calendar?.days ?? []}
                hasPosition
                livePositions={liveCalendarPositions}
                showSummaryPL={false}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function buildTickerStripItems(
  indexes: IndexSummary[],
  oilQuotes: GlobalMarketQuote[],
  commodityQuotes: GlobalMarketQuote[]
) {
  const indexMap = new Map(indexes.map((index) => [index.symbol.toUpperCase(), index]));
  const marketMap = new Map(
    [...oilQuotes, ...commodityQuotes].map((quote) => [quote.symbol.toUpperCase(), quote])
  );

  const headlineTicker = indexToTicker(indexMap.get("KSE100")) ?? null;
  const tickerItems = [
    indexToTicker(indexMap.get("KSE30")),
    indexToTicker(indexMap.get("KMI30")),
    marketToTicker(marketMap.get("CL=F"), "WTI Crude Oil"),
    marketToTicker(marketMap.get("BZ=F"), "Brent Crude Oil"),
    marketToTicker(marketMap.get("GC=F"), "Gold"),
    marketToTicker(marketMap.get("SI=F"), "Silver"),
  ].filter(Boolean) as DashboardTickerItem[];

  return { headlineTicker, tickerItems };
}

function indexToTicker(index: IndexSummary | undefined): DashboardTickerItem | null {
  if (!index || !Number.isFinite(index.current)) return null;
  return {
    symbol: index.symbol,
    current: index.current,
    change: index.change,
    changePct: index.changePct,
  };
}

function marketToTicker(
  quote: GlobalMarketQuote | undefined,
  label: string
): DashboardTickerItem | null {
  if (
    !quote ||
    quote.price == null ||
    quote.change == null ||
    quote.changePct == null ||
    !Number.isFinite(quote.price)
  ) {
    return null;
  }
  return {
    symbol: quote.symbol,
    label,
    current: quote.price,
    change: quote.change,
    changePct: quote.changePct,
  };
}

function MoversCard({
  title,
  icon,
  items,
}: {
  title: string;
  icon: "up" | "down";
  items: HoldingWithMetrics[];
}) {
  return (
    <Card size="sm" className="min-w-0">
      <CardHeader className="flex-row items-center gap-2">
        {icon === "up" ? (
          <ArrowUpRight className="size-4 text-gain" />
        ) : (
          <ArrowDownRight className="size-4 text-loss" />
        )}
        <CardTitle className="text-sm sm:text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">No data.</p>
        )}
        {items.map((h) => (
          <Link
            key={h.id}
            href={`/stock/${h.symbol}`}
            className="block rounded-lg px-1.5 py-1.5 hover:bg-accent/50 sm:flex sm:items-center sm:justify-between sm:gap-3 sm:px-2"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{h.symbol}</p>
              <p className="text-xs text-muted-foreground">
                {formatPKR(h.livePrice)}
              </p>
            </div>
            <div className="mt-1 min-w-0 sm:mt-0 sm:text-right">
              <p className={`truncate text-sm font-medium tabular-nums ${plColorClass(h.dayChange)}`}>
                {formatPKR(h.dayChange, { sign: true })}
              </p>
              <p className={`text-xs tabular-nums ${plColorClass(h.dayChangePct)}`}>
                {formatPercent(h.dayChangePct)}
              </p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
