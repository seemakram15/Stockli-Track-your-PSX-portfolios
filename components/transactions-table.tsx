import Link from "next/link";
import type * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatPKR, formatNumber, formatDate } from "@/lib/format";
import type { Transaction, TransactionType } from "@/lib/types";

const TYPE_STYLES: Record<TransactionType, string> = {
  BUY: "bg-gain/10 text-gain",
  SELL: "bg-loss/10 text-loss",
  ADD: "bg-muted text-muted-foreground",
  EDIT: "bg-muted text-muted-foreground",
  REMOVE: "bg-muted text-muted-foreground",
};

export function TransactionsTable({
  transactions,
  showSymbol = true,
  showBuyPL = false,
  currentPriceBySymbol,
}: {
  transactions: Transaction[];
  showSymbol?: boolean;
  showBuyPL?: boolean;
  currentPriceBySymbol?: Record<string, number | null>;
}) {
  if (transactions.length === 0) {
    return (
      <p className="px-2 py-6 text-center text-sm text-muted-foreground">
        No transactions recorded yet.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3 p-3 sm:hidden">
        {transactions.map((t) => (
          <div key={t.id} className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    TYPE_STYLES[t.type]
                  )}
                >
                  {t.type}
                </span>
                {showSymbol && (
                  <Link href={`/stock/${t.symbol}`} className="mt-2 block font-semibold hover:text-primary">
                    {t.symbol}
                  </Link>
                )}
              </div>
              <p className="shrink-0 text-right text-xs text-muted-foreground">
                {formatDate(t.transacted_at)}
              </p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <MobileMetric label="Quantity" value={t.quantity ? formatNumber(t.quantity, 0) : "—"} />
              <MobileMetric label="Price" value={t.price ? formatPKR(t.price) : "—"} align="right" />
              <MobileMetric label="Total" value={t.quantity && t.price ? formatPKR(t.quantity * t.price) : "—"} />
              <MobileMetric
                label={showBuyPL ? "Total Buy P/L" : "Fees"}
                value={renderTrailingMetric(t, showBuyPL, currentPriceBySymbol)}
                align="right"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto scrollbar-thin sm:block">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Type</TableHead>
            {showSymbol && <TableHead>Symbol</TableHead>}
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="hidden text-right sm:table-cell">
              {showBuyPL ? "Total Buy P/L" : "Fees"}
            </TableHead>
            <TableHead className="text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => (
            <TableRow key={t.id}>
              <TableCell>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    TYPE_STYLES[t.type]
                  )}
                >
                  {t.type}
                </span>
              </TableCell>
              {showSymbol && (
                <TableCell>
                  <Link href={`/stock/${t.symbol}`} className="font-medium hover:text-primary">
                    {t.symbol}
                  </Link>
                </TableCell>
              )}
              <TableCell className="text-right tabular-nums">
                {t.quantity ? formatNumber(t.quantity, 0) : "—"}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {t.price ? formatPKR(t.price) : "—"}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {t.quantity && t.price ? formatPKR(t.quantity * t.price) : "—"}
              </TableCell>
              <TableCell className="hidden text-right tabular-nums sm:table-cell">
                {renderTrailingMetric(t, showBuyPL, currentPriceBySymbol)}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatDate(t.transacted_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    </>
  );
}

function renderTrailingMetric(
  transaction: Transaction,
  showBuyPL: boolean,
  currentPriceBySymbol?: Record<string, number | null>
) {
  if (!showBuyPL) {
    return <span className="text-muted-foreground">{formatPKR(transaction.fees)}</span>;
  }

  const currentPrice = currentPriceBySymbol?.[transaction.symbol.toUpperCase()] ?? null;
  const pnl = computeBuyTransactionPL(transaction, currentPrice);

  if (pnl == null) {
    return <span className="text-muted-foreground">—</span>;
  }

  return <span className={cn("font-medium", pnl > 0 ? "text-gain" : pnl < 0 ? "text-loss" : "text-foreground")}>{formatPKR(pnl, { sign: true })}</span>;
}

function computeBuyTransactionPL(transaction: Transaction, currentPrice: number | null) {
  if (transaction.type !== "BUY") return null;
  if (
    currentPrice == null ||
    !Number.isFinite(currentPrice) ||
    !Number.isFinite(transaction.price) ||
    !Number.isFinite(transaction.quantity)
  ) {
    return null;
  }

  const livePrice = Number(currentPrice);
  const quantity = Number(transaction.quantity ?? 0);
  const buyPrice = Number(transaction.price ?? 0);
  const fees = Number(transaction.fees ?? 0);
  return livePrice * quantity - (buyPrice * quantity + fees);
}

function MobileMetric({
  label,
  value,
  align = "left",
}: {
  label: string;
  value: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium tabular-nums">{value}</p>
    </div>
  );
}
