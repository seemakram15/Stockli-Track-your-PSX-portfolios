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
    <div className="flex items-center px-3 pb-1 pt-2 sm:px-4 lg:hidden">
      <div
        className="relative flex h-9 cursor-pointer select-none items-center rounded-xl bg-muted/80 p-1"
        onClick={() => setMobileView((v) => (v === "compact" ? "detailed" : "compact"))}
      >
        <div
          className={cn(
            "absolute top-1 h-7 w-[calc(50%-4px)] rounded-lg bg-emerald-600 shadow-sm transition-transform duration-200 dark:bg-emerald-500",
            mobileView === "detailed" ? "translate-x-[calc(100%+4px)]" : "translate-x-0",
          )}
        />
        <span className={cn("relative z-10 w-20 text-center text-xs font-semibold transition-colors", mobileView === "compact" ? "text-white" : "text-muted-foreground")}>
          Compact
        </span>
        <span className={cn("relative z-10 w-20 text-center text-xs font-semibold transition-colors", mobileView === "detailed" ? "text-white" : "text-muted-foreground")}>
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
      {/* Cards below lg so columns never overlay on tablet/phone */}
      <div className="lg:hidden">
        {MobileToggle}
        <div className="space-y-2 p-3 sm:p-4">
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
      </div>

      <DesktopHoldingsBoard
        rows={rows}
        showPortfolio={showPortfolio}
        portfolioNames={portfolioNames}
        rowActions={rowActions}
        userId={userId}
      />
    </>
  );
}

function DesktopHoldingsBoard({
  rows,
  showPortfolio,
  portfolioNames,
  rowActions,
  userId,
}: {
  rows: HoldingWithMetrics[];
  showPortfolio: boolean;
  portfolioNames?: Record<string, string>;
  rowActions?: { demo?: boolean };
  userId?: string | null;
}) {
  const totals = React.useMemo(() => {
    return rows.reduce(
      (acc, h) => {
        acc.marketValue += h.marketValue;
        acc.dayChange += h.dayChange;
        acc.unrealizedPL += h.unrealizedPL;
        acc.costBasis += h.costBasis;
        return acc;
      },
      { marketValue: 0, dayChange: 0, unrealizedPL: 0, costBasis: 0 }
    );
  }, [rows]);

  const dayPct =
    totals.marketValue - totals.dayChange !== 0
      ? (totals.dayChange / (totals.marketValue - totals.dayChange)) * 100
      : 0;
  const unrealizedPct =
    totals.costBasis !== 0 ? (totals.unrealizedPL / totals.costBasis) * 100 : 0;

  /* Symbol | Qty | Current | Avg | Day P/L | Unrealized | Invested | Mkt value | Actions */
  const cols =
    "grid w-full grid-cols-[minmax(0,1.25fr)_minmax(0,0.35fr)_minmax(0,0.72fr)_minmax(0,0.72fr)_minmax(0,0.85fr)_minmax(0,0.85fr)_minmax(0,0.85fr)_minmax(0,0.9fr)_4.75rem] items-center gap-x-1.5 px-3 xl:gap-x-2.5 xl:px-5";

  const cell = "min-w-0 overflow-hidden text-right";
  const money = "block truncate whitespace-nowrap text-sm font-normal tabular-nums text-foreground";

  return (
    <div className="hidden text-sm lg:block">
      <div
        className={cn(
          cols,
          "border-b border-border/80 py-2.5 text-sm font-medium text-muted-foreground",
        )}
      >
        <div className="min-w-0 text-left">Symbol</div>
        <div className="text-right">Qty</div>
        <div className="text-right">Current</div>
        <div className="text-right">Avg price</div>
        <div className="text-right">Day P/L</div>
        <div className="text-right">Unrealized</div>
        <div className="text-right">Invested</div>
        <div className="text-right">Mkt value</div>
        <div aria-hidden />
      </div>

      {rows.map((h) => (
        <div
          key={h.id}
          className={cn(
            cols,
            "group border-b border-border/50 py-2.5 transition-colors last:border-b-0 hover:bg-muted/25",
          )}
        >
          <div className="min-w-0 overflow-hidden pr-1">
            <StockIdentity
              href={`/stock/${h.symbol}`}
              symbol={h.symbol}
              name={
                showPortfolio
                  ? portfolioNames?.[h.portfolio_id] ??
                    h.ticker?.company_name ??
                    h.ticker?.sector
                  : h.ticker?.company_name ?? h.ticker?.sector
              }
              size="xs"
            />
          </div>
          <div className={cn(cell, money)}>{formatNumber(h.quantity, 0)}</div>
          <div className={cell}>
            <div className={money}>{formatPKR(h.livePrice)}</div>
          </div>
          <div className={cell}>
            <div className={cn(money, "text-muted-foreground")}>
              {formatPKR(h.avg_buy_price)}
            </div>
          </div>
          <div className={cell}>
            <AlignedPL value={h.dayChange} pct={h.dayChangePct} />
          </div>
          <div className={cell}>
            <AlignedPL value={h.unrealizedPL} pct={h.unrealizedPLPct} />
          </div>
          <div className={cell}>
            <div className={money}>{formatPKR(h.costBasis)}</div>
          </div>
          <div className={cell}>
            <div className={cn(money, "tracking-tight")}>
              {formatPKR(h.marketValue)}
            </div>
          </div>
          <div className="flex w-full shrink-0 justify-end gap-0 opacity-70 transition group-hover:opacity-100 [&_button]:size-7">
            {rowActions ? (
              <HoldingRowActions
                portfolioId={h.portfolio_id}
                holdingId={h.id}
                symbol={h.symbol}
                quantity={h.quantity}
                demo={rowActions.demo}
                userId={userId}
              />
            ) : null}
          </div>
        </div>
      ))}

      <div className={cn(cols, "border-t border-border/80 bg-muted/20 py-2.5")}>
        <div className="min-w-0 overflow-hidden">
          <p className="text-sm font-medium text-muted-foreground">
            Portfolio totals
          </p>
          <p className="text-sm font-normal text-foreground">
            {rows.length} holding{rows.length === 1 ? "" : "s"}
          </p>
        </div>
        <div />
        <div />
        <div />
        <div className={cell}>
          <AlignedPL value={totals.dayChange} pct={dayPct} />
        </div>
        <div className={cell}>
          <AlignedPL value={totals.unrealizedPL} pct={unrealizedPct} />
        </div>
        <div className={cell}>
          <div className={money}>{formatPKR(totals.costBasis)}</div>
        </div>
        <div className={cell}>
          <div className={cn(money, "tracking-tight")}>
            {formatPKR(totals.marketValue)}
          </div>
        </div>
        <div />
      </div>
    </div>
  );
}

function AlignedPL({ value, pct }: { value: number; pct: number }) {
  return (
    <div className="min-w-0 overflow-hidden text-right leading-tight">
      <div className={cn("truncate text-sm font-normal tabular-nums", plColorClass(value))}>
        {formatPKR(value, { sign: true })}
      </div>
      <div className={cn("truncate text-xs font-normal tabular-nums", plColorClass(pct))}>
        {formatPercent(pct)}
      </div>
    </div>
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
          <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Avg price</p>
          <p className="font-semibold tabular-nums text-foreground">{formatNumber(holding.avg_buy_price, 2)}</p>
        </div>
        <div className="border-l border-amber-500/20 px-4 py-2.5">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Qty</p>
          <p className="font-semibold tabular-nums text-foreground">{formatNumber(holding.quantity, 0)}</p>
        </div>
      </div>

      <AmberRule />

      {/* Row 2: Day's P/L | Unrealized */}
      <div className="grid grid-cols-2">
        <div className="px-4 py-2.5">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Day P/L</p>
          <p className={cn("font-semibold leading-tight tabular-nums", dayClass)}>
            {formatPKR(holding.dayChange, { sign: true })}
          </p>
          <p className={cn("text-xs font-medium tabular-nums", dayClass)}>
            ({formatPercent(holding.dayChangePct)})
          </p>
        </div>
        <div className="border-l border-amber-500/20 px-4 py-2.5">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Unrealized</p>
          <p className={cn("font-semibold leading-tight tabular-nums", totalClass)}>
            {formatPKR(holding.unrealizedPL, { sign: true })}
          </p>
          <p className={cn("text-xs font-medium tabular-nums", totalClass)}>
            ({formatPercent(holding.unrealizedPLPct)})
          </p>
        </div>
      </div>

      <AmberRule />

      {/* Row 3: Invested | Mkt Value */}
      <div className="grid grid-cols-2">
        <div className="px-4 py-2.5 pb-4">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Invested</p>
          <p className="font-semibold tabular-nums text-foreground">{formatPKR(holding.costBasis)}</p>
        </div>
        <div className="border-l border-amber-500/20 px-4 py-2.5 pb-4">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Mkt value</p>
          <p className="font-semibold tabular-nums text-foreground">{formatPKR(holding.marketValue)}</p>
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
        <span className="text-sm tabular-nums text-muted-foreground">
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
