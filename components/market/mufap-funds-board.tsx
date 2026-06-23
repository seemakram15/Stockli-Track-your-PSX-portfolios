"use client";

import * as React from "react";
import {
  ArrowDownUp,
  BadgePercent,
  BarChart3,
  Coins,
  ExternalLink,
  LineChart,
  PieChart,
  RefreshCw,
  Search,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatDateTime,
  formatNumber,
  formatPercent,
  formatPKR,
  plColorClass,
} from "@/lib/format";
import { identifyAmcBrand } from "@/lib/amc-brands";
import { cn } from "@/lib/utils";
import { AmcBrandMark } from "@/components/market/amc-brand-mark";
import type { FundClassFilter, MufapFund, MufapFundsData } from "@/lib/services/mufap";

type SortKey =
  | "name"
  | "amc"
  | "nav"
  | "d1"
  | "mtd"
  | "ytd"
  | "d365"
  | "profitOn100k";

type StrategyFilter = "all" | "stock" | "income" | "money-market" | "allocation";

const CLASS_FILTERS: Array<{ value: FundClassFilter; label: string }> = [
  { value: "all", label: "All funds" },
  { value: "islamic", label: "Islamic funds" },
  { value: "conventional", label: "Conventional funds" },
  { value: "pension", label: "Pension funds" },
];

const STRATEGY_FILTERS: Array<{ value: StrategyFilter; label: string; icon: LucideIcon }> = [
  { value: "all", label: "All", icon: BadgePercent },
  { value: "stock", label: "Stock funds", icon: BarChart3 },
  { value: "money-market", label: "Money market", icon: Coins },
  { value: "income", label: "Income", icon: LineChart },
  { value: "allocation", label: "Asset allocation", icon: PieChart },
];

export function MufapFundsBoard({
  data,
  title,
  etfMode = false,
}: {
  data: MufapFundsData;
  title: string;
  etfMode?: boolean;
}) {
  const [query, setQuery] = React.useState("");
  const [fundClass, setFundClass] = React.useState<FundClassFilter>("all");
  const [strategy, setStrategy] = React.useState<StrategyFilter>("all");
  const [amc, setAmc] = React.useState("all");
  const [sortKey, setSortKey] = React.useState<SortKey>("d1");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");

  const amcOptions = React.useMemo(() => {
    const counts = new Map<string, number>();
    const logos = new Map<string, string>();
    for (const fund of data.funds) {
      counts.set(fund.amc, (counts.get(fund.amc) ?? 0) + 1);
      if (fund.amcLogoUrl && !logos.has(fund.amc)) logos.set(fund.amc, fund.amcLogoUrl);
    }
    return data.amcs
      .map((item) => ({
        value: item,
        brand: identifyAmcBrand(item),
        count: counts.get(item) ?? 0,
        logoUrl: logos.get(item) ?? null,
      }))
      .sort((a, b) => a.brand.shortName.localeCompare(b.brand.shortName));
  }, [data.amcs, data.funds]);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.funds
      .filter((fund) => {
        const matchesQuery =
          !q ||
          fund.name.toLowerCase().includes(q) ||
          fund.amc.toLowerCase().includes(q) ||
          fund.type.toLowerCase().includes(q);
        const matchesClass = fundClass === "all" || fund.classFilter === fundClass;
        const matchesStrategy = strategy === "all" || strategyMatches(fund, strategy);
        const matchesAmc = amc === "all" || fund.amc === amc;
        return matchesQuery && matchesClass && matchesStrategy && matchesAmc;
      })
      .sort((a, b) => compareFunds(a, b, sortKey, sortDir));
  }, [amc, data.funds, fundClass, query, sortDir, sortKey, strategy]);

  const summary = React.useMemo(() => {
    const visible = rows.filter((fund) => fund.d1 != null);
    const avg1d = visible.length
      ? visible.reduce((sum, fund) => sum + (fund.d1 ?? 0), 0) / visible.length
      : 0;
    const best = [...visible].sort((a, b) => (b.d1 ?? 0) - (a.d1 ?? 0))[0] ?? null;
    const worst = [...visible].sort((a, b) => (a.d1 ?? 0) - (b.d1 ?? 0))[0] ?? null;
    return { avg1d, best, worst };
  }, [rows]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" || key === "amc" ? "asc" : "desc");
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Funds" value={rows.length.toLocaleString("en-US")} />
        <Metric label="Average 1 day" value={formatPercent(summary.avg1d)} tone={summary.avg1d} />
        <Metric
          label="Best 1 day"
          value={summary.best ? `${summary.best.amcShort} ${formatPercent(summary.best.d1)}` : "—"}
          tone={summary.best?.d1}
        />
        <Metric
          label="Rs 100k P/L"
          value={formatPKR(rows.reduce((sum, fund) => sum + (fund.profitOn100k ?? 0), 0), { sign: true })}
          tone={rows.reduce((sum, fund) => sum + (fund.profitOn100k ?? 0), 0)}
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="gap-5 border-b border-border bg-gradient-to-br from-card via-card to-primary/5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                MUFAP official data · updated {formatDateTime(data.updatedAt)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="size-4" />
                Refresh
              </Button>
              <Button asChild variant="outline">
                <a href={data.sourceUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  MUFAP
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2 xl:grid-cols-[minmax(260px,1fr)_auto]">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search fund name..."
                  className="pl-9"
                />
              </label>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setAmc("all");
                  setFundClass("all");
                  setStrategy("all");
                }}
              >
                Clear filters
              </Button>
            </div>

            <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
              <FilterGroup label="AMC">
                <div className="grid max-h-56 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
                  <FilterPill
                    active={amc === "all"}
                    onClick={() => setAmc("all")}
                    label="All"
                    count={data.funds.length}
                  />
                  {amcOptions.map((item) => (
                    <FilterPill
                      key={item.value}
                      active={amc === item.value}
                      onClick={() => setAmc(item.value)}
                      label={item.brand.shortName}
                      count={item.count}
                      icon={
                        <AmcBrandMark
                          label={item.value}
                          selected={amc === item.value}
                          size="sm"
                          logoUrl={item.logoUrl}
                        />
                      }
                    />
                  ))}
                </div>
              </FilterGroup>

              {!etfMode && (
                <FilterGroup label="Fund class">
                  <div className="flex flex-wrap gap-2">
                    {CLASS_FILTERS.map((item) => (
                      <FilterPill
                        key={item.value}
                        active={fundClass === item.value}
                        onClick={() => setFundClass(item.value)}
                        label={item.label}
                      />
                    ))}
                  </div>
                </FilterGroup>
              )}

              <FilterGroup label="Type" isLast>
                <div className="flex flex-wrap gap-2">
                  {STRATEGY_FILTERS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <FilterPill
                        key={item.value}
                        active={strategy === item.value}
                        onClick={() => setStrategy(item.value)}
                        label={item.label}
                        icon={
                          <Icon
                            className={cn(
                              "size-4",
                              strategy === item.value ? "text-primary-foreground" : "text-muted-foreground"
                            )}
                          />
                        }
                      />
                    );
                  })}
                </div>
              </FilterGroup>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0 sm:px-2">
          <div className="overflow-x-auto scrollbar-thin">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead label="Fund name" active={sortKey === "name"} onClick={() => toggleSort("name")} />
                  <SortableHead label="AMC" active={sortKey === "amc"} onClick={() => toggleSort("amc")} />
                  <TableHead>Type</TableHead>
                  <SortableHead label="NAV" active={sortKey === "nav"} onClick={() => toggleSort("nav")} align="right" />
                  <SortableHead label="1 day" active={sortKey === "d1"} onClick={() => toggleSort("d1")} align="right" />
                  <SortableHead label="MTD" active={sortKey === "mtd"} onClick={() => toggleSort("mtd")} align="right" />
                  <SortableHead label="YTD" active={sortKey === "ytd"} onClick={() => toggleSort("ytd")} align="right" />
                  <SortableHead label="365 days" active={sortKey === "d365"} onClick={() => toggleSort("d365")} align="right" />
                  <SortableHead label="Rs 100k P/L" active={sortKey === "profitOn100k"} onClick={() => toggleSort("profitOn100k")} align="right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((fund) => (
                  <TableRow key={`${fund.fundId ?? fund.name}-${fund.type}`}>
                    <TableCell>
                      <div className="flex min-w-[280px] items-start gap-3">
                        <AmcBrandMark label={fund.amc} size="md" logoUrl={fund.amcLogoUrl} />
                        <div className="min-w-0">
                        {fund.fundId ? (
                          <Link
                            href={`/${etfMode ? "market/etfs" : "market/mutual-funds"}/${fund.fundId}`}
                            className="font-semibold hover:text-primary"
                          >
                            {fund.name}
                          </Link>
                        ) : (
                          <p className="font-semibold">{fund.name}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {fund.amcShort} · {fund.validityDate ?? "—"} · {fund.riskProfile ?? "Risk N/A"}
                        </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-56">
                      <span className="font-medium">{fund.amcShort}</span>
                      <p className="truncate text-xs text-muted-foreground">{fund.amc}</p>
                    </TableCell>
                    <TableCell>{fund.type}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(fund.nav, 4)}</TableCell>
                    <ReturnCell value={fund.d1} />
                    <ReturnCell value={fund.mtd} />
                    <ReturnCell value={fund.ytd} />
                    <ReturnCell value={fund.d365} />
                    <TableCell className={cn("text-right font-semibold tabular-nums", plColorClass(fund.profitOn100k))}>
                      {formatPKR(fund.profitOn100k, { sign: true })}
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-sm text-muted-foreground">
                      No funds match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FilterGroup({
  label,
  children,
  isLast = false,
}: {
  label: string;
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid gap-3 py-3 md:grid-cols-[92px_minmax(0,1fr)] md:items-start",
        !isLast && "border-b border-border"
      )}
    >
      <p className="pt-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  icon,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-11 min-w-0 items-center justify-between gap-2 rounded-xl border px-3 text-sm font-semibold shadow-sm transition-colors",
        active
          ? "border-[#2554d9] bg-[#2554d9] text-white"
          : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent"
      )}
    >
      <span className="flex min-w-0 items-center gap-2">
        {icon}
        <span className="truncate">{label}</span>
      </span>
      {typeof count === "number" ? (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs tabular-nums",
            active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

function ReturnCell({ value }: { value: number | null }) {
  return (
    <TableCell className={cn("text-right font-medium tabular-nums", plColorClass(value))}>
      {formatPercent(value)}
    </TableCell>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: number | null;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("mt-2 text-2xl font-bold tabular-nums", plColorClass(tone))}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function SortableHead({
  label,
  active,
  align = "left",
  onClick,
}: {
  label: string;
  active: boolean;
  align?: "left" | "right";
  onClick: () => void;
}) {
  return (
    <TableHead className={align === "right" ? "text-right" : ""}>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide hover:text-foreground"
      >
        {label}
        <ArrowDownUp className={cn("size-3", active ? "text-primary" : "text-muted-foreground")} />
      </button>
    </TableHead>
  );
}

function compareFunds(a: MufapFund, b: MufapFund, key: SortKey, dir: "asc" | "desc") {
  const factor = dir === "asc" ? 1 : -1;
  if (key === "name") return a.name.localeCompare(b.name) * factor;
  if (key === "amc") return a.amc.localeCompare(b.amc) * factor;
  return (numericValue(a, key) - numericValue(b, key)) * factor;
}

function numericValue(fund: MufapFund, key: SortKey) {
  if (key === "nav") return fund.nav ?? -Infinity;
  if (key === "d1") return fund.d1 ?? -Infinity;
  if (key === "mtd") return fund.mtd ?? -Infinity;
  if (key === "ytd") return fund.ytd ?? -Infinity;
  if (key === "d365") return fund.d365 ?? -Infinity;
  if (key === "profitOn100k") return fund.profitOn100k ?? -Infinity;
  return 0;
}

function strategyMatches(fund: MufapFund, strategy: StrategyFilter) {
  const haystack = `${fund.name} ${fund.type} ${fund.category} ${fund.sector}`.toLowerCase();
  if (strategy === "stock") return /\b(stock|equity|index|sector)\b/.test(haystack);
  if (strategy === "money-market") return haystack.includes("money market") || haystack.includes("cash");
  if (strategy === "income") return haystack.includes("income") || haystack.includes("sovereign");
  return haystack.includes("asset allocation") || haystack.includes("balanced") || haystack.includes("allocation");
}
