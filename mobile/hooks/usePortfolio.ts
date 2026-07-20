import useSWR from "swr";
import { db } from "@/lib/db";

export function usePortfolios() {
  return useSWR("portfolios", db.portfolios.list, { revalidateOnFocus: true });
}

export function useHoldings(portfolioId: string | null) {
  return useSWR(
    portfolioId ? `holdings:${portfolioId}` : null,
    () => db.holdings.forPortfolio(portfolioId!),
    { revalidateOnFocus: true }
  );
}

export function useTransactions(portfolioId: string | null) {
  return useSWR(
    portfolioId ? `transactions:${portfolioId}` : null,
    () => db.transactions.forPortfolio(portfolioId!),
    { revalidateOnFocus: true }
  );
}

export function useWatchlists() {
  return useSWR("watchlists", db.watchlists.list, { revalidateOnFocus: true });
}

export function useAlerts() {
  return useSWR("alerts", db.alerts.list, {
    refreshInterval: 60_000,
    revalidateOnFocus: true,
  });
}

export function useAllHoldings() {
  return useSWR("all-holdings", db.holdings.all, { revalidateOnFocus: true });
}
