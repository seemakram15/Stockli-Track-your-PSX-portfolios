import "server-only";
import { buildPortfolioView, enrichHoldings, getPortfolioViewRaw } from "@/lib/services/portfolio";
import { getQuotes } from "@/lib/services/prices";
import { getPortfolioCalendar, type StockCalendar } from "@/lib/services/daily-pl";
import { marketStatus } from "@/lib/psx/market-hours";
import type { PortfolioWithMetrics } from "@/lib/types";

export interface PortfolioPageData {
  portfolio: PortfolioWithMetrics;
  calendar: StockCalendar | null;
  quoteBySymbol: Record<string, number | null>;
  market: ReturnType<typeof marketStatus>;
  updatedAt: string;
}

export async function getPortfolioPageData(id: string): Promise<PortfolioPageData | null> {
  const raw = await getPortfolioViewRaw(id);
  if (!raw) return null;

  const [enriched, calendar] = await Promise.all([
    enrichHoldings(raw.holdings, raw.transactions),
    raw.holdings.length ? getPortfolioCalendar(raw.holdings, raw.transactions) : Promise.resolve(null),
  ]);

  const portfolio = buildPortfolioView(raw.portfolio, enriched, raw.transactions);
  const quoteBySymbol = await buildQuoteBySymbol(portfolio);

  return {
    portfolio,
    calendar,
    quoteBySymbol,
    market: marketStatus(),
    updatedAt: new Date().toISOString(),
  };
}

async function buildQuoteBySymbol(portfolio: PortfolioWithMetrics) {
  const symbols = Array.from(
    new Set(portfolio.transactions.map((transaction) => transaction.symbol.toUpperCase()).filter(Boolean))
  );

  if (symbols.length === 0) {
    return {};
  }

  const priceBySymbol = new Map<string, number | null>(
    portfolio.holdings.map((holding) => [
      holding.symbol.toUpperCase(),
      Number.isFinite(holding.livePrice) ? holding.livePrice : null,
    ])
  );
  const missingSymbols = symbols.filter((symbol) => priceBySymbol.get(symbol) == null);

  if (missingSymbols.length > 0) {
    const quotes = await getQuotes(missingSymbols);
    for (const symbol of missingSymbols) {
      priceBySymbol.set(symbol, quotes.get(symbol)?.price ?? null);
    }
  }

  return Object.fromEntries(symbols.map((symbol) => [symbol, priceBySymbol.get(symbol) ?? null]));
}
