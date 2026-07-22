"use client";

import * as React from "react";
import Link from "next/link";
import { Activity, ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { IconChip, type Accent } from "@/components/ui/accent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangeBadge } from "@/components/change-badge";
import { StockIdentity } from "@/components/stock/stock-identity";
import { cn } from "@/lib/utils";
import { formatCompact, formatPKR } from "@/lib/format";
import type { MarketPerformer, MarketPerformers as MarketPerformersData } from "@/lib/services/market";

const ACCENT_SURFACE: Record<Accent, string> = {
  primary: "from-primary/12 via-primary/5 to-transparent",
  emerald: "from-emerald-500/12 via-emerald-500/5 to-transparent",
  sky: "from-sky-500/12 via-sky-500/5 to-transparent",
  violet: "from-violet-500/12 via-violet-500/5 to-transparent",
  amber: "from-amber-500/12 via-amber-500/5 to-transparent",
  rose: "from-rose-500/12 via-rose-500/5 to-transparent",
  teal: "from-teal-500/12 via-teal-500/5 to-transparent",
  indigo: "from-indigo-500/12 via-indigo-500/5 to-transparent",
  orange: "from-orange-500/12 via-orange-500/5 to-transparent",
  slate: "from-slate-500/12 via-slate-500/5 to-transparent",
};

const ACCENT_RANK: Record<Accent, string> = {
  primary: "bg-primary/15 text-primary",
  emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  sky: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  violet: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  amber: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  rose: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  teal: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
  indigo: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  orange: "bg-orange-500/15 text-orange-800 dark:text-orange-300",
  slate: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
};

export function MarketPerformers({
  data,
  showHeader = true,
}: {
  data: MarketPerformersData;
  showHeader?: boolean;
}) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const updateScrollHints = React.useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(max > 8 && el.scrollLeft < max - 8);
  }, []);

  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateScrollHints();
    el.addEventListener("scroll", updateScrollHints, { passive: true });
    const ro = new ResizeObserver(updateScrollHints);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollHints);
      ro.disconnect();
    };
  }, [updateScrollHints, data]);

  function scrollByPanel(direction: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const panel = el.querySelector<HTMLElement>("[data-performer-panel]");
    const amount = panel ? panel.offsetWidth + 16 : el.clientWidth * 0.85;
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  return (
    <Card className={cn(!showHeader && "border-0 bg-transparent shadow-none ring-0")}>
      {showHeader && (
        <CardHeader className="flex-row items-center gap-3">
          <IconChip accent="sky" variant="gradient">
            <Activity />
          </IconChip>
          <CardTitle>Market Performers</CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn(!showHeader && "p-0")}>
        <div className="relative">
          {/* Edge fades */}
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-background to-transparent transition-opacity xl:hidden",
              canScrollLeft ? "opacity-100" : "opacity-0"
            )}
          />
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent transition-opacity xl:hidden",
              canScrollRight ? "opacity-100" : "opacity-0"
            )}
          />

          {/* Floating scroll hints — right arrow invites swipe to more cards */}
          <button
            type="button"
            aria-label="Previous performers"
            onClick={() => scrollByPanel(-1)}
            className={cn(
              "absolute left-1 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-background/95 text-foreground shadow-lg backdrop-blur transition-all xl:hidden",
              canScrollLeft
                ? "opacity-100"
                : "pointer-events-none opacity-0"
            )}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="More performers"
            onClick={() => scrollByPanel(1)}
            className={cn(
              "absolute right-1 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-background/95 text-foreground shadow-lg backdrop-blur transition-all xl:hidden",
              "animate-[pulse_2.4s_ease-in-out_infinite]",
              canScrollRight
                ? "opacity-100"
                : "pointer-events-none opacity-0"
            )}
          >
            <ChevronRight className="size-5" />
          </button>

          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-thin xl:grid xl:grid-cols-3 xl:overflow-visible xl:pb-0"
          >
            <PerformerPanel
              title="Top Active"
              subtitle="By volume"
              icon={<Activity />}
              accent="sky"
              rows={data.active}
            />
            <PerformerPanel
              title="Top Advancers"
              subtitle="Biggest gains"
              icon={<ArrowUpRight />}
              accent="emerald"
              rows={data.advancers}
            />
            <PerformerPanel
              title="Top Decliners"
              subtitle="Biggest losses"
              icon={<ArrowDownRight />}
              accent="rose"
              rows={data.decliners}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PerformerPanel({
  title,
  subtitle,
  icon,
  accent,
  rows,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: Accent;
  rows: MarketPerformer[];
}) {
  return (
    <section
      data-performer-panel
      className="flex w-[min(100%,22rem)] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-soft sm:w-[min(100%,24rem)] xl:w-auto xl:min-w-0"
    >
      <header
        className={cn(
          "relative flex items-center gap-3 border-b border-border/70 bg-gradient-to-r px-4 py-3.5",
          ACCENT_SURFACE[accent] ?? ACCENT_SURFACE.sky
        )}
      >
        <IconChip accent={accent} variant="gradient" size="sm">
          {icon}
        </IconChip>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-tight">{title}</h3>
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
        <span className="ml-auto rounded-full bg-background/70 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground ring-1 ring-border/60">
          {rows.length}
        </span>
      </header>

      <ul className="divide-y divide-border/60">
        {rows.map((row, index) => (
          <li key={row.symbol}>
            <Link
              href={`/stock/${row.symbol}`}
              className="group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/40 sm:px-4 sm:py-3"
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold tabular-nums",
                  ACCENT_RANK[accent] ?? ACCENT_RANK.sky
                )}
              >
                {index + 1}
              </span>

              <StockIdentity
                symbol={row.symbol}
                size="xs"
                showName={false}
                subtitle={`Vol ${formatCompact(row.volume)}`}
                className="min-w-0 flex-1 gap-2"
                monoClassName="group-hover:text-primary"
              />

              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold tabular-nums">{formatPKR(row.price)}</p>
                <ChangeBadge
                  value={row.change}
                  pct={row.changePct}
                  showValue
                  variant="pill"
                  className="mt-1 justify-end"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
