"use client";

import * as React from "react";
import {
  Activity,
  ArrowRight,
  Bell,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Coins,
  Globe2,
  LineChart,
  PieChart,
  ShieldCheck,
  Smartphone,
  Star,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SERVICES: Array<{ label: string; icon: LucideIcon; tone: "gain" | "info" | "gold" }> = [
  { label: "PSX portfolios", icon: Wallet, tone: "gain" },
  { label: "Daily P/L calendars", icon: CalendarRange, tone: "info" },
  { label: "Mutual funds", icon: Coins, tone: "gold" },
  { label: "ETF tracking", icon: PieChart, tone: "gain" },
  { label: "US indices", icon: LineChart, tone: "info" },
  { label: "India indices", icon: Globe2, tone: "gain" },
  { label: "Crypto market", icon: Activity, tone: "gold" },
  { label: "Price alerts", icon: Bell, tone: "info" },
  { label: "Installable app", icon: Smartphone, tone: "gain" },
  { label: "Secure access", icon: ShieldCheck, tone: "info" },
];

const FLOW = [
  { label: "Market signal", value: "KSE100 +1.06%", note: "Live index movement" },
  { label: "Portfolio math", value: "+Rs 8,906", note: "Day P/L is preserved" },
  { label: "Allocation", value: "15 positions", note: "Holdings and sectors" },
  { label: "Action layer", value: "Alerts ready", note: "Watchlists and triggers" },
];

const FEATURE_CARDS: Array<{ icon: LucideIcon; title: string; desc: string }> = [
  {
    icon: Wallet,
    title: "Multi-portfolio tracking",
    desc: "Track cost basis, current value, day P/L, unrealized P/L and realized returns across every portfolio.",
  },
  {
    icon: CalendarRange,
    title: "Persistent P/L calendars",
    desc: "Preserve daily PKR gain and loss history, while the current session stays live when the market is open.",
  },
  {
    icon: LineChart,
    title: "Market-grade stock pages",
    desc: "Move from a holding to detailed stock views with current prices, positions and calendar returns.",
  },
  {
    icon: PieChart,
    title: "Allocation intelligence",
    desc: "Understand holdings by sector, portfolio, symbol and shares with clean visual summaries.",
  },
  {
    icon: Star,
    title: "Watchlists and alerts",
    desc: "Follow symbols before buying and keep price thresholds visible without cluttering the dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by design",
    desc: "Per-user access controls, admin gates and row-level security keep portfolio data separated.",
  },
];

const TICKS = [
  ["FFC", "+1.42%", "gain"],
  ["MEBL", "+0.74%", "gain"],
  ["PPL", "-0.21%", "loss"],
  ["Gold", "+0.33%", "gain"],
  ["BTC", "+1.18%", "gain"],
  ["WTI", "-0.46%", "loss"],
] as const;

export function LandingCommandPanel() {
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % FLOW.length);
    }, 1800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative min-w-0">
      <div className="absolute -inset-6 rounded-[2rem] border border-white/10 bg-white/5 blur-2xl" />
      <div className="relative min-w-0 overflow-hidden rounded-2xl border border-white/15 bg-[#081714]/80 p-4 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200/70">
              Live command flow
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">One screen, every market move</h2>
          </div>
          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-xs font-semibold text-emerald-100">
            Active
          </span>
        </div>

        <div className="grid gap-2">
          {FLOW.map((item, index) => {
            const active = activeIndex === index;
            return (
              <div key={item.label} className="flex items-center gap-2">
                <div
                  className={cn(
                    "min-w-0 flex-1 rounded-xl border p-3 transition duration-500",
                    active
                      ? "border-emerald-300/40 bg-emerald-300/15 text-white shadow-[0_0_24px_rgba(16,185,129,0.22)]"
                      : "border-white/10 bg-white/[0.06] text-white/75"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium uppercase tracking-wide text-white/45">
                      {item.label}
                    </span>
                    <span className="text-sm font-semibold tabular-nums">{item.value}</span>
                  </div>
                  <p className="mt-1 text-xs text-white/55">{item.note}</p>
                </div>
                <ArrowRight
                  className={cn(
                    "size-4 shrink-0 transition sm:size-5",
                    active ? "translate-x-1 text-emerald-200" : "text-white/25"
                  )}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-black/20">
          <div className="flex animate-stockli-marquee gap-2 px-2 py-2">
            {[...TICKS, ...TICKS].map(([symbol, change, tone], index) => (
              <span
                key={`${symbol}-${index}`}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg border bg-white/[0.08] px-3 py-2 text-xs font-semibold",
                  tone === "gain" ? "border-emerald-300/20 text-emerald-100" : "border-red-300/20 text-red-100"
                )}
              >
                {symbol}
                <span className="tabular-nums">{change}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingFeatureShowcase() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const activeFeature = FEATURE_CARDS[activeIndex];
  const ActiveIcon = activeFeature.icon;

  function move(direction: -1 | 1) {
    setActiveIndex((index) => (index + direction + FEATURE_CARDS.length) % FEATURE_CARDS.length);
  }

  return (
    <>
      <div className="sm:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous feature"
            onClick={() => move(-1)}
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm"
          >
            <ChevronLeft className="size-5" />
          </button>

          <div className="min-h-[15.5rem] min-w-0 flex-1 rounded-xl border border-border bg-background p-5 shadow-sm">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ActiveIcon className="size-5" />
            </span>
            <h3 className="mt-4 text-base font-semibold">{activeFeature.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{activeFeature.desc}</p>
            <p className="mt-5 text-xs font-semibold text-muted-foreground">
              {activeIndex + 1} / {FEATURE_CARDS.length}
            </p>
          </div>

          <button
            type="button"
            aria-label="Next feature"
            onClick={() => move(1)}
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
        <div className="mt-3 flex justify-center gap-1.5">
          {FEATURE_CARDS.map((feature, index) => (
            <button
              key={feature.title}
              type="button"
              aria-label={`Show ${feature.title}`}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === activeIndex ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>

      <div className="hidden gap-4 sm:grid sm:grid-cols-2">
        {FEATURE_CARDS.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-background p-5 shadow-sm"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.desc}</p>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function ServiceMarquee({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden", className)}>
      <div className="flex w-max animate-stockli-marquee items-center gap-3">
        {[...SERVICES, ...SERVICES].map((service, index) => {
          const Icon = service.icon;
          return (
            <span
              key={`${service.label}-${index}`}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm font-semibold shadow-sm",
                service.tone === "gain" && "border-primary/20 text-primary",
                service.tone === "info" && "border-chart-2/25 text-chart-2",
                service.tone === "gold" && "border-chart-3/30 text-chart-3"
              )}
            >
              <Icon className="size-4" />
              {service.label}
              <ArrowRight className="size-3.5 opacity-50" />
            </span>
          );
        })}
      </div>
    </div>
  );
}
