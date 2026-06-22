"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowDownUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AmcBrandMark } from "@/components/market/amc-brand-mark";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPercent, formatPKR, plColorClass } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MarketStrategyData, StrategyFundRow } from "@/lib/services/market-strategy";

type ClassFilter = "all" | "islamic" | "conventional";
type ToneFilter = "all" | "gain" | "loss";
type SortKey = "name" | "amc" | "class" | "type" | "returnPct" | "estimatedReturn";

export function MarketStrategyBoard({ data }: { data: MarketStrategyData }) {
  const [query, setQuery] = React.useState("");
  const [classFilter, setClassFilter] = React.useState<ClassFilter>("all");
  const [toneFilter, setToneFilter] = React.useState<ToneFilter>("all");
  const [sortKey, setSortKey] = React.useState<SortKey>("amc");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

  const allRows = React.useMemo(
    () => [
      ...data.islamic.map((row) => ({ ...row, strategyClass: "Islamic" as const })),
      ...data.conventional.map((row) => ({ ...row, strategyClass: "Conventional" as const })),
    ],
    [data.conventional, data.islamic]
  );

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return allRows
      .filter((row) => {
        const matchesQuery =
          !q ||
          row.name.toLowerCase().includes(q) ||
          row.amc.toLowerCase().includes(q) ||
          row.amcShort.toLowerCase().includes(q) ||
          row.type.toLowerCase().includes(q);
        const matchesClass =
          classFilter === "all" ||
          (classFilter === "islamic" && row.strategyClass === "Islamic") ||
          (classFilter === "conventional" && row.strategyClass === "Conventional");
        const matchesTone =
          toneFilter === "all" ||
          (toneFilter === "gain" && (row.estimatedReturn ?? 0) >= 0) ||
          (toneFilter === "loss" && (row.estimatedReturn ?? 0) < 0);
        return matchesQuery && matchesClass && matchesTone;
      })
      .sort((a, b) => compareRows(a, b, sortKey, sortDir));
  }, [allRows, classFilter, query, sortDir, sortKey, toneFilter]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "returnPct" || key === "estimatedReturn" ? "desc" : "asc");
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-gradient-to-br from-card via-card to-primary/5 p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-normal">Estimated fund returns</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Color rows by estimated return per {formatPKR(data.investmentAmount)}. Green is gain, red is loss.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ["all", "All funds"],
              ["islamic", "Islamic"],
              ["conventional", "Conventional"],
            ].map(([value, label]) => (
              <Button
                key={value}
                type="button"
                variant={classFilter === value ? "default" : "outline"}
                size="sm"
                onClick={() => setClassFilter(value as ClassFilter)}
              >
                {label}
              </Button>
            ))}
            {[
              ["all", "All returns"],
              ["gain", "Gainers"],
              ["loss", "Losses"],
            ].map(([value, label]) => (
              <Button
                key={value}
                type="button"
                variant={toneFilter === value ? "secondary" : "outline"}
                size="sm"
                onClick={() => setToneFilter(value as ToneFilter)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <label className="relative mt-4 block max-w-2xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search fund, AMC, strategy..."
            className="pl-9"
          />
        </label>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead label="Fund" active={sortKey === "name"} onClick={() => toggleSort("name")} />
              <SortableHead label="AMC" active={sortKey === "amc"} onClick={() => toggleSort("amc")} />
              <SortableHead label="Class" active={sortKey === "class"} onClick={() => toggleSort("class")} />
              <SortableHead label="Type" active={sortKey === "type"} onClick={() => toggleSort("type")} />
              <SortableHead label="Return" active={sortKey === "returnPct"} onClick={() => toggleSort("returnPct")} align="right" />
              <SortableHead label="Rs 100k estimate" active={sortKey === "estimatedReturn"} onClick={() => toggleSort("estimatedReturn")} align="right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${row.fundId ?? row.name}-${row.strategyClass}`} className={rowTint(row.estimatedReturn)}>
                <TableCell>
                  <div className="min-w-[280px]">
                    {row.fundId ? (
                      <Link href={`/market/mutual-funds/${row.fundId}`} className="font-semibold hover:underline">
                        {row.name}
                      </Link>
                    ) : (
                      <p className="font-semibold">{row.name}</p>
                    )}
                    <p className="text-xs opacity-75">{row.type}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex min-w-[190px] items-center gap-2">
                    <AmcBrandMark label={row.amc} size="sm" />
                    <div className="min-w-0">
                      <p className="font-medium">{row.amcShort}</p>
                      <p className="truncate text-xs opacity-75">{row.amc}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{row.strategyClass}</TableCell>
                <TableCell className="max-w-56 truncate">{row.type}</TableCell>
                <TableCell className={cn("text-right font-semibold tabular-nums", plColorClass(row.returnPct))}>
                  {formatPercent(row.returnPct)}
                </TableCell>
                <TableCell className={cn("text-right text-base font-bold tabular-nums", plColorClass(row.estimatedReturn))}>
                  {formatPKR(row.estimatedReturn, { sign: true })}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-sm text-muted-foreground">
                  No funds match the current strategy filters.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
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
        className={cn(
          "inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide hover:text-foreground",
          align === "right" && "justify-end"
        )}
      >
        {label}
        <ArrowDownUp className={cn("size-3", active ? "text-primary" : "text-muted-foreground")} />
      </button>
    </TableHead>
  );
}

function compareRows(
  a: StrategyFundRow & { strategyClass: "Islamic" | "Conventional" },
  b: StrategyFundRow & { strategyClass: "Islamic" | "Conventional" },
  key: SortKey,
  dir: "asc" | "desc"
) {
  const factor = dir === "asc" ? 1 : -1;
  if (key === "name") return a.name.localeCompare(b.name) * factor;
  if (key === "amc") return (a.amcShort || a.amc).localeCompare(b.amcShort || b.amc) * factor;
  if (key === "class") return a.strategyClass.localeCompare(b.strategyClass) * factor;
  if (key === "type") return a.type.localeCompare(b.type) * factor;
  if (key === "returnPct") return ((a.returnPct ?? -Infinity) - (b.returnPct ?? -Infinity)) * factor;
  return ((a.estimatedReturn ?? -Infinity) - (b.estimatedReturn ?? -Infinity)) * factor;
}

function rowTint(value: number | null) {
  if (value == null) return "bg-muted/20";
  if (value >= 0) return "bg-emerald-50/85 dark:bg-emerald-950/30";
  return "bg-red-50/90 dark:bg-red-950/30";
}
