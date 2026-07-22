"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChangeBadge } from "@/components/change-badge";
import { HoldingRowActions } from "@/components/portfolio/holding-row-actions";
import { StockIdentity } from "@/components/stock/stock-identity";
import { useLiveHoldings } from "@/lib/hooks/use-live-holdings";
import { formatPKR, formatNumber, formatPercent, plColorClass } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { HoldingWithMetrics } from "@/lib/types";

export function HoldingsTable({
  holdings,
  showPortfolio = false,
  portfolioNames,
  rowActions,
  compact = false,
  userId,
}: {
  holdings: HoldingWithMetrics[];
  showPortfolio?: boolean;
  portfolioNames?: Record<string, string>;
  /** When set, renders per-row trade/remove actions. */
  rowActions?: { demo?: boolean };
  /** Compact view for dashboard summaries. Portfolio pages keep the full detail table. */
  compact?: boolean;
  userId?: string | null;
}) {
  const { liveHoldings: rows } = useLiveHoldings(holdings);
  const [mobileView, setMobileView] = React.useState<"detailed" | "compact">("compact");

  const MobileToggle = (
    <div className="flex items-center px-3 pb-1 pt-2 sm:hidden">
      <div
        className="relative flex h-8 cursor-pointer select-none items-center rounded-full bg-muted p-0.5"
        onClick={() => setMobileView((v) => (v === "compact" ? "detailed" : "compact"))}
      >
        <div
          className={cn(
            "absolute top-0.5 h-7 w-[calc(50%-2px)] rounded-full bg-primary transition-transform duration-200",
            mobileView === "detailed" ? "translate-x-[calc(100%+4px)]" : "translate-x-0.5",
          )}
        />
        <span className={cn("relative z-10 w-20 text-center text-xs font-semibold transition-colors", mobileView === "compact" ? "text-primary-foreground" : "text-muted-foreground")}>
          Compact
        </span>
        <span className={cn("relative z-10 w-20 text-center text-xs font-semibold transition-colors", mobileView === "detailed" ? "text-primary-foreground" : "text-muted-foreground")}>
          Detailed
        </span>
      </div>
    </div>
  );

  if (compact) {
    return (
      <>
        {MobileToggle}
        <div className="space-y-2 p-3 sm:hidden">
          {rows.map((h) =>
            mobileView === "compact" ? (
              <MobileHoldingCardCompact key={h.id} holding={h} portfolioName={showPortfolio ? portfolioNames?.[h.portfolio_id] : undefined} />
            ) : (
              <MobileHoldingCard
                key={h.id}
                holding={h}
                portfolioName={showPortfolio ? portfolioNames?.[h.portfolio_id] : undefined}
              />
            ),
          )}
        </div>

        <div className="hidden overflow-x-auto scrollbar-thin sm:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Symbol</TableHead>
                {showPortfolio && <TableHead>Portfolio</TableHead>}
                <TableHead className="text-right">Current</TableHead>
                <TableHead className="text-right">Day P/L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((h) => (
                <TableRow key={h.id} className="group">
                  <TableCell>
                    <StockIdentity
                      href={`/stock/${h.symbol}`}
                      symbol={h.symbol}
                      name={h.ticker?.company_name ?? h.ticker?.sector}
                      size="xs"
                    />
                  </TableCell>
                  {showPortfolio && (
                    <TableCell className="text-muted-foreground">
                      {portfolioNames?.[h.portfolio_id] ?? "—"}
                    </TableCell>
                  )}
                  <TableCell className="text-right tabular-nums">
                    {formatPKR(h.livePrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DailyPLValue value={h.dayChange} pct={h.dayChangePct} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </>
    );
  }

  return (
    <>
      {MobileToggle}
      <div className="space-y-2 p-3 sm:hidden">
        {rows.map((h) => {
          const actions = rowActions ? (
            <HoldingRowActions
              portfolioId={h.portfolio_id}
              holdingId={h.id}
              symbol={h.symbol}
              quantity={h.quantity}
              demo={rowActions.demo}
              userId={userId}
            />
          ) : null;
          return mobileView === "compact" ? (
            <MobileHoldingCardCompact
              key={h.id}
              holding={h}
              portfolioName={showPortfolio ? portfolioNames?.[h.portfolio_id] : undefined}
            />
          ) : (
            <MobileHoldingCard
              key={h.id}
              holding={h}
              portfolioName={showPortfolio ? portfolioNames?.[h.portfolio_id] : undefined}
              actions={actions}
            />
          );
        })}
      </div>

      <div className="hidden overflow-x-auto scrollbar-thin sm:block">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Symbol</TableHead>
            {showPortfolio && <TableHead className="hidden md:table-cell">Portfolio</TableHead>}
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="hidden text-right sm:table-cell">Avg Cost</TableHead>
            <TableHead className="text-right">Current</TableHead>
            <TableHead className="text-right">Day P/L</TableHead>
            <TableHead className="text-right">Mkt Value</TableHead>
            <TableHead className="text-right">Unreal. P/L</TableHead>
            {rowActions && <TableHead className="w-10" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((h) => (
            <TableRow key={h.id} className="group">
              <TableCell>
                <StockIdentity
                  href={`/stock/${h.symbol}`}
                  symbol={h.symbol}
                  name={h.ticker?.company_name ?? h.ticker?.sector}
                  size="xs"
                />
              </TableCell>
              {showPortfolio && (
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {portfolioNames?.[h.portfolio_id] ?? "—"}
                </TableCell>
              )}
              <TableCell className="text-right tabular-nums">
                {formatNumber(h.quantity, 0)}
              </TableCell>
              <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">
                {formatPKR(h.avg_buy_price)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatPKR(h.livePrice)}
              </TableCell>
              <TableCell className="text-right">
                <DailyPLValue value={h.dayChange} pct={h.dayChangePct} />
              </TableCell>
              <TableCell className="text-right tabular-nums font-medium">
                {formatPKR(h.marketValue)}
              </TableCell>
              <TableCell className="text-right">
                <div className={cn("font-medium tabular-nums", plColorClass(h.unrealizedPL))}>
                  {formatPKR(h.unrealizedPL, { sign: true })}
                </div>
                <ChangeBadge pct={h.unrealizedPLPct} className="justify-end text-xs" />
              </TableCell>
              {rowActions && (
                <TableCell className="text-right">
                  <HoldingRowActions
                    portfolioId={h.portfolio_id}
                    holdingId={h.id}
                    symbol={h.symbol}
                    quantity={h.quantity}
                    demo={rowActions.demo}
                    userId={userId}
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    </>
  );
}

function DailyPLValue({ value, pct }: { value: number; pct: number }) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className={cn("font-semibold tabular-nums", plColorClass(value))}>
        {formatPKR(value, { sign: true })}
      </span>
      <ChangeBadge pct={pct} className="justify-end text-xs" />
    </div>
  );
}

function MobileHoldingCard({
  holding,
  portfolioName,
  actions,
}: {
  holding: HoldingWithMetrics;
  portfolioName?: string;
  actions?: React.ReactNode;
}) {
  const dayClass = plColorClass(holding.dayChange);
  const totalClass = plColorClass(holding.unrealizedPL);

  return (
    <article className="overflow-hidden rounded-2xl border-2 border-border bg-card shadow-sm">
      {/* Header: ticker + current price + actions */}
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <StockIdentity
            href={`/stock/${holding.symbol}`}
            symbol={holding.symbol}
            name={holding.ticker?.company_name}
            size="md"
            className="min-w-0"
          />
          <div className="min-w-0 border-l border-border/70 pl-3">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
              {portfolioName ?? "Current"}
            </p>
            <p className="text-lg font-semibold leading-tight tabular-nums text-foreground">
              {formatNumber(holding.livePrice, 2)}
            </p>
          </div>
        </div>
        {actions && (
          <div className="shrink-0 [&_button]:size-8 [&_button]:rounded-full [&_button]:bg-muted/60">
            {actions}
          </div>
        )}
      </div>

      <AmberRule />

      {/* Row 1: Avg Buy | Shares */}
      <div className="grid grid-cols-2">
        <div className="px-4 py-2.5">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Avg Buy</p>
          <p className="tabular-nums font-semibold text-foreground">{formatNumber(holding.avg_buy_price, 2)}</p>
        </div>
        <div className="border-l border-amber-500/20 px-4 py-2.5">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Shares</p>
          <p className="tabular-nums font-semibold text-foreground">{formatNumber(holding.quantity, 0)}</p>
        </div>
      </div>

      <AmberRule />

      {/* Row 2: Day's P/L | Total P/L */}
      <div className="grid grid-cols-2">
        <div className="px-4 py-2.5">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Day&apos;s P/L</p>
          <p className={cn("font-semibold leading-tight tabular-nums", dayClass)}>
            {formatPKR(holding.dayChange, { sign: true })}
          </p>
          <p className={cn("text-xs font-medium tabular-nums", dayClass)}>
            ({formatPercent(holding.dayChangePct)})
          </p>
        </div>
        <div className="border-l border-amber-500/20 px-4 py-2.5">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Total P/L</p>
          <p className={cn("font-semibold leading-tight tabular-nums", totalClass)}>
            {formatPKR(holding.unrealizedPL, { sign: true })}
          </p>
          <p className={cn("text-xs font-medium tabular-nums", totalClass)}>
            ({formatPercent(holding.unrealizedPLPct)})
          </p>
        </div>
      </div>

      <AmberRule />

      {/* Row 3: Total Cost | Mkt Value */}
      <div className="grid grid-cols-2">
        <div className="px-4 py-2.5 pb-4">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Total Cost</p>
          <p className="tabular-nums font-semibold text-foreground">{formatPKR(holding.costBasis)}</p>
        </div>
        <div className="border-l border-amber-500/20 px-4 py-2.5 pb-4">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Mkt Value</p>
          <p className="tabular-nums font-semibold text-foreground">{formatPKR(holding.marketValue)}</p>
        </div>
      </div>
    </article>
  );
}

function MobileHoldingCardCompact({
  holding,
  portfolioName,
}: {
  holding: HoldingWithMetrics;
  portfolioName?: string;
}) {
  const dayClass = plColorClass(holding.dayChange);
  void portfolioName;

  return (
    <article className="flex flex-col gap-1 rounded-xl border-2 border-border bg-card px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <StockIdentity
          href={`/stock/${holding.symbol}`}
          symbol={holding.symbol}
          name={holding.ticker?.company_name}
          size="sm"
          className="min-w-0"
        />
        <span className="shrink-0 font-semibold tabular-nums text-foreground">
          {formatPKR(holding.marketValue)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground tabular-nums">
          {formatNumber(holding.quantity, 0)} × {formatNumber(holding.livePrice, 2)}
        </span>
        <span className={cn("text-sm font-semibold tabular-nums", dayClass)}>
          {formatPKR(holding.dayChange, { sign: true })}{" "}
          <span className="text-xs font-medium">({formatPercent(holding.dayChangePct)})</span>
        </span>
      </div>
    </article>
  );
}

function AmberRule() {
  return (
    <div
      className="h-px w-full"
      style={{
        background: "linear-gradient(to right, transparent, rgba(245,158,11,0.55), transparent)",
        boxShadow: "0 0 8px rgba(245,158,11,0.18)",
      }}
    />
  );
}
