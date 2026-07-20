import "server-only";
import type {
  Transaction,
  Holding,
  TaxSettings,
  ReceivedDividend,
  UpcomingDividend,
  DividendIncomeSummary,
} from "@/lib/types";
import type { DividendHistoryRow, BookClosureRow } from "@/lib/services/market-resources";
import { calcDividendTaxes } from "@/lib/services/tax";

function parsePayout(raw: string): number {
  const match = raw.replace(/,/g, "").match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

export function getHoldingQtyAtDate(
  transactions: Transaction[],
  symbol: string,
  date: string
): number {
  return transactions
    .filter((t) => t.symbol.toUpperCase() === symbol.toUpperCase() && t.transacted_at <= date)
    .sort((a, b) => a.transacted_at.localeCompare(b.transacted_at))
    .reduce((qty, t) => {
      if (t.type === "BUY") return qty + Number(t.quantity);
      if (t.type === "SELL") return qty - Number(t.quantity);
      return qty;
    }, 0);
}

const MS_PER_DAY = 86_400_000;

function isWithin180Days(dateA: string, dateB: string): boolean {
  return Math.abs(new Date(dateA).getTime() - new Date(dateB).getTime()) < 180 * MS_PER_DAY;
}

export function buildAutoEntries(
  bookClosures: BookClosureRow[],
  everHeldSymbols: Set<string>,
  existingReceived: ReceivedDividend[],
  getQty: (symbol: string, date: string) => number,
  settings: TaxSettings,
  today: string
): ReceivedDividend[] {
  return bookClosures
    .filter((bc) => {
      if (!bc.payout || !bc.bookClosureFrom || bc.bookClosureFrom === "—") return false;
      if (bc.bookClosureFrom >= today) return false;
      return everHeldSymbols.has(bc.symbol.toUpperCase());
    })
    .flatMap((bc): ReceivedDividend[] => {
      const perShare = parsePayout(bc.payout);
      if (perShare <= 0) return [];
      const qty = getQty(bc.symbol, bc.bookClosureFrom);
      if (qty <= 0) return [];
      const alreadyCovered = existingReceived.some(
        (r) =>
          r.symbol.toUpperCase() === bc.symbol.toUpperCase() &&
          isWithin180Days(r.creditedOn, bc.bookClosureFrom)
      );
      if (alreadyCovered) return [];
      const gross = qty * perShare;
      const { wht, zakat, net } = calcDividendTaxes(gross, settings);
      const creditedOn =
        bc.bookClosureTo && bc.bookClosureTo !== "—" ? bc.bookClosureTo : bc.bookClosureFrom;
      return [
        {
          symbol: bc.symbol.toUpperCase(),
          companyName: bc.company,
          creditedOn,
          perShare,
          quantityHeld: qty,
          grossAmount: gross,
          whtAmount: wht,
          zakatAmount: zakat,
          netAmount: net,
          source: "auto",
        } satisfies ReceivedDividend,
      ];
    });
}

export function getDividendIncomeForPortfolio(
  transactions: Transaction[],
  dividendHistory: DividendHistoryRow[],
  bookClosures: BookClosureRow[],
  currentHoldings: Holding[],
  settings: TaxSettings
): DividendIncomeSummary {
  const everHeldSymbols = new Set(transactions.map((t) => t.symbol.toUpperCase()));
  const today = new Date().toISOString().split("T")[0];

  const historyReceived: ReceivedDividend[] = dividendHistory
    .filter((d) => everHeldSymbols.has(d.symbol.toUpperCase()))
    .flatMap((d) => {
      const perShare = parsePayout(d.payout);
      if (perShare <= 0) return [];
      const qty = getHoldingQtyAtDate(transactions, d.symbol, d.creditedOn);
      if (qty <= 0) return [];
      const gross = qty * perShare;
      const { wht, zakat, net } = calcDividendTaxes(gross, settings);
      return [
        {
          symbol: d.symbol.toUpperCase(),
          creditedOn: d.creditedOn,
          perShare,
          quantityHeld: qty,
          grossAmount: gross,
          whtAmount: wht,
          zakatAmount: zakat,
          netAmount: net,
          source: "history",
        } satisfies ReceivedDividend,
      ];
    });

  const autoReceived = buildAutoEntries(
    bookClosures,
    everHeldSymbols,
    historyReceived,
    (symbol, date) => getHoldingQtyAtDate(transactions, symbol, date),
    settings,
    today
  );

  const received: ReceivedDividend[] = [...historyReceived, ...autoReceived].sort(
    (a, b) => b.creditedOn.localeCompare(a.creditedOn)
  );

  const heldSymbols = new Set(currentHoldings.map((h) => h.symbol.toUpperCase()));
  const upcoming: UpcomingDividend[] = bookClosures
    .filter((bc) => {
      if (!heldSymbols.has(bc.symbol.toUpperCase()) || !bc.payout) return false;
      const from = bc.bookClosureFrom;
      return !from || from === "—" || from >= today;
    })
    .map((bc) => {
      const holding = currentHoldings.find(
        (h) => h.symbol.toUpperCase() === bc.symbol.toUpperCase()
      );
      return {
        symbol: bc.symbol.toUpperCase(),
        company: bc.company,
        payout: bc.payout,
        bookClosureFrom: bc.bookClosureFrom,
        bookClosureTo: bc.bookClosureTo,
        currentQty: Number(holding?.quantity ?? 0),
      } satisfies UpcomingDividend;
    });

  const totalGross = received.reduce((s, r) => s + r.grossAmount, 0);
  const totalWHT = received.reduce((s, r) => s + r.whtAmount, 0);
  const totalZakat = received.reduce((s, r) => s + r.zakatAmount, 0);
  const totalNet = received.reduce((s, r) => s + r.netAmount, 0);

  return { received, upcoming, totalGross, totalWHT, totalZakat, totalNet };
}
