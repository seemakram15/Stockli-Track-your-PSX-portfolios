"use client";

import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { AllocationSlice } from "@/lib/types";
import { formatPKRCompact, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

interface AllocationChartProps {
  data: AllocationSlice[];
  maxSlices?: number;
  /** Labels drawn on slices: ticker/name, invested %, or none. */
  sliceLabelMode?: false | "name" | "percent";
  /** @deprecated use sliceLabelMode="name" */
  showSliceLabels?: boolean;
  /** Donut (holdings) vs fuller pie (sectors). */
  chartStyle?: "donut" | "pie";
  variant?: "default" | "expanded";
  legendVariant?: "default" | "holdingPairs";
  centerContent?: React.ReactNode;
  className?: string;
}

export function AllocationChart({
  data,
  maxSlices = 6,
  sliceLabelMode,
  showSliceLabels = false,
  chartStyle = "donut",
  variant = "default",
  legendVariant = "default",
  centerContent,
  className,
}: AllocationChartProps) {
  const [mounted, setMounted] = React.useState(false);
  const labelMode = sliceLabelMode ?? (showSliceLabels ? "name" : false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No allocation data
      </div>
    );
  }

  // Collapse a long tail into "Other" so the donut stays legible.
  const top = data.slice(0, maxSlices);
  const rest = data.slice(maxSlices);
  const slices =
    rest.length > 0
      ? [
          ...top,
          {
            label: "Other",
            value: rest.reduce((a, b) => a + b.value, 0),
            pct: rest.reduce((a, b) => a + b.pct, 0),
          },
        ]
      : top;

  const expanded = variant === "expanded";
  const holdingPairs = legendVariant === "holdingPairs";
  const isPie = chartStyle === "pie";
  const chartHeightClass = expanded
    ? "h-80 sm:h-96 lg:h-[26rem]"
    : labelMode
      ? "h-60 sm:h-72"
      : "h-52 sm:h-60";
  // Generous ring — room around the pie for small-slice callouts.
  const innerRadius = isPie ? "18%" : "42%";
  const outerRadius = labelMode ? (isPie ? "70%" : "68%") : isPie ? "78%" : "76%";

  if (!mounted) {
    return (
      <div
        className={cn(
          "grid items-center gap-4",
          expanded ? "lg:grid-cols-[minmax(18rem,0.9fr)_minmax(18rem,1.1fr)]" : "grid-cols-1",
          className
        )}
      >
        <div className={cn("rounded-xl bg-muted/10", chartHeightClass)} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid items-center gap-4",
        expanded ? "lg:grid-cols-[minmax(18rem,0.9fr)_minmax(18rem,1.1fr)]" : "grid-cols-1",
        className
      )}
    >
      <div className={cn("relative w-full min-w-0 overflow-visible", chartHeightClass)}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 18, right: 28, bottom: 18, left: 28 }}>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="label"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              stroke="var(--card)"
              strokeWidth={2.5}
              isAnimationActive={false}
              label={
                labelMode
                  ? (props) => renderSliceLabel({ ...props, mode: labelMode })
                  : false
              }
              labelLine={false}
            >
              {slices.map((_, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                  className="outline-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.06)]"
                />
              ))}
            </Pie>
            <Tooltip content={<AllocationTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {centerContent && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">
            {centerContent}
          </div>
        )}
      </div>
      <ul
        className={cn(
          "grid min-w-0",
          holdingPairs
            ? "grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-sm"
            : cn(
                "grid-cols-1 gap-2 text-sm",
                expanded ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-1"
              )
        )}
      >
        {slices.map((s, i) => (
          <li
            key={`${s.label}-${i}`}
            className={cn(
              "grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2",
              expanded && !holdingPairs && "rounded-xl border border-border bg-muted/15 p-3"
            )}
          >
            <span
              className="size-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span
              className={cn(
                "min-w-0 font-medium leading-tight",
                holdingPairs ? "truncate" : "break-words"
              )}
            >
              {s.label}
            </span>
            <span className="text-right tabular-nums text-muted-foreground">
              {formatPercent(s.pct).replace("+", "")}
              {expanded && !holdingPairs && (
                <span className="block text-xs">{formatPKRCompact(s.value)}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Large slices: bold label inside the arc (original look).
 * Small / long labels: outside callout lines so tickers stay readable.
 */
function renderSliceLabel(props: {
  cx?: number | string;
  cy?: number | string;
  midAngle?: number;
  innerRadius?: number | string;
  outerRadius?: number | string;
  payload?: AllocationSlice;
  percent?: number;
  mode: "name" | "percent";
}) {
  const { cx, cy, midAngle, innerRadius, outerRadius, payload, percent, mode } = props;
  if (cx == null || cy == null || midAngle == null || !payload) return null;

  const pct = (percent ?? payload.pct / 100) * 100;
  if (pct < 1) return null;

  const inner = Number(innerRadius) || 0;
  const outer = Number(outerRadius) || 0;
  const label =
    mode === "percent"
      ? formatPercent(pct).replace("+", "")
      : payload.label.toUpperCase();

  // Match original feel: keep labels inside whenever the slice is wide enough.
  const insideMin = mode === "percent" ? 6.5 : label.length <= 4 ? 7 : 9.5;
  const placeOutside = pct < insideMin;

  const radian = (Math.PI / 180) * -midAngle;
  const cos = Math.cos(radian);
  const sin = Math.sin(radian);
  const cxN = Number(cx);
  const cyN = Number(cy);

  if (!placeOutside) {
    const radius = inner + (outer - inner) * 0.52;
    return (
      <text
        x={cxN + radius * cos}
        y={cyN + radius * sin}
        fill="var(--card)"
        textAnchor="middle"
        dominantBaseline="central"
        className={cn(
          "pointer-events-none font-bold drop-shadow-sm",
          mode === "percent" ? "text-[11px] tabular-nums" : "text-[10px] tracking-tight"
        )}
      >
        {label}
      </text>
    );
  }

  const startX = cxN + (outer + 2) * cos;
  const startY = cyN + (outer + 2) * sin;
  const midX = cxN + (outer + 16) * cos;
  const midY = cyN + (outer + 16) * sin;
  const endX = midX + (cos >= 0 ? 1 : -1) * 10;
  const endY = midY;
  const textX = endX + (cos >= 0 ? 4 : -4);
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g className="pointer-events-none">
      <path
        d={`M${startX},${startY}L${midX},${midY}L${endX},${endY}`}
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="text-muted-foreground/50"
      />
      <circle cx={startX} cy={startY} r={2} className="fill-muted-foreground/55" />
      <text
        x={textX}
        y={endY}
        textAnchor={textAnchor}
        dominantBaseline="central"
        className={cn(
          "fill-foreground font-semibold",
          mode === "percent" ? "text-[10px] tabular-nums" : "text-[10px] tracking-tight"
        )}
      >
        {label}
      </text>
    </g>
  );
}

function AllocationTooltip({ active, payload }: { active?: boolean; payload?: { payload: AllocationSlice }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{d.label}</p>
      <p className="tabular-nums text-muted-foreground">
        {formatPKRCompact(d.value)} · {formatPercent(d.pct).replace("+", "")}
      </p>
    </div>
  );
}
