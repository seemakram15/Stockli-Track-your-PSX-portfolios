"use client";

import * as React from "react";
import {
  BarChart3,
  Brain,
  Loader2,
  PieChart,
  ShieldCheck,
  Target,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  buildDeterministicPortfolioSuggestionInsight,
  type PortfolioSuggestionAiInsight,
} from "@/lib/analysis/sector-portfolio-ai";
import {
  type PortfolioDuration,
  type PortfolioObjective,
  type SuggestedPortfolio,
} from "@/lib/analysis/portfolio-suggestions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { usePersistentResource } from "@/lib/hooks/use-persistent-resource";

type PortfolioAiPayload = {
  duration: PortfolioDuration;
  objective: PortfolioObjective;
  holdings: number;
  deterministic: PortfolioSuggestionAiInsight;
  insight: PortfolioSuggestionAiInsight;
  generatedAt: string;
};

const HOLDING_OPTIONS = [4, 5, 6, 8, 10];
const CHART_COLORS = ["#10b981", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ef4444", "#14b8a6"];

export function PortfolioSuggestions() {
  const [duration, setDuration] = React.useState<PortfolioDuration>("long-term");
  const [objective, setObjective] = React.useState<PortfolioObjective>("income-and-growth");
  const [holdings, setHoldings] = React.useState(6);
  const [submitted, setSubmitted] = React.useState({
    duration: "long-term" as PortfolioDuration,
    objective: "income-and-growth" as PortfolioObjective,
    holdings: 6,
  });

  const cacheKey = React.useMemo(
    () =>
      `public:portfolio-suggestions:v5:${submitted.duration}:${submitted.objective}:${submitted.holdings}`,
    [submitted.duration, submitted.holdings, submitted.objective]
  );
  const url = React.useMemo(
    () =>
      `/api/public/portfolio-suggestions?duration=${submitted.duration}&objective=${submitted.objective}&holdings=${submitted.holdings}`,
    [submitted.duration, submitted.holdings, submitted.objective]
  );
  const resource = usePersistentResource<SuggestedPortfolio>({
    cacheKey,
    url,
    refreshInterval: 30 * 60 * 1000,
  });

  const aiFallback = React.useMemo(
    () => (resource.data ? buildDeterministicPortfolioSuggestionInsight(resource.data) : null),
    [resource.data]
  );
  const aiBody = React.useMemo(
    () =>
      resource.data
        ? ({
            duration: resource.data.duration,
            objective: resource.data.objective,
            holdings: resource.data.holdingsRequested,
          } satisfies {
            duration: PortfolioDuration;
            objective: PortfolioObjective;
            holdings: number;
          })
        : null,
    [resource.data]
  );
  const { data: aiData, loading: aiLoading, error: aiError, refresh } =
    usePostJson<PortfolioAiPayload>("/api/private/portfolio-suggestions/ai", aiBody);
  const aiInsight = aiData?.insight ?? aiFallback;

  function generatePortfolio() {
    setSubmitted({ duration, objective, holdings });
  }

  const portfolio = resource.data;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <Card variant="feature" className="overflow-hidden">
        <CardContent className="space-y-6 p-5 sm:p-6">
          <div className="space-y-3">
            <Badge variant="violet" className="h-6 px-3 text-[11px] uppercase tracking-[0.2em]">
              Portfolio Suggestions
            </Badge>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
                Let Stockli draft a diversified PSX portfolio
              </h1>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground sm:text-base">
                Tell Stockli how long you want to hold, what kind of return you want, and how many
                names you are comfortable tracking. The shortlist then leans toward stronger sectors,
                healthier fundamentals, blue-chip anchors, and credible growth names instead of
                chasing weak quality rallies.
              </p>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                generatePortfolio();
              }}
              className="rounded-[2rem] border bg-background/90 p-5 shadow-soft"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Portfolio setup
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight">Build a stronger PSX shortlist</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    Choose the holding period, return style and basket size. Stockli will then try to
                    mix steadier blue-chip anchors with stronger growth names from healthier sectors.
                  </p>
                </div>
                <Badge variant="success" className="h-8 rounded-full px-3 text-xs">
                  AI summary included automatically
                </Badge>
              </div>

              <div className="mt-5 grid gap-4">
                <ToggleGroup
                  label="Duration"
                  description="Pick the kind of holding period you have in mind."
                  value={duration}
                  onChange={(value) => setDuration(value as PortfolioDuration)}
                  items={[
                    ["short-term", "Short term"],
                    ["long-term", "Long term"],
                  ]}
                  columnsClassName="sm:grid-cols-2"
                />

                <ToggleGroup
                  label="Goal"
                  description="Tell Stockli whether you want income, growth, or a blend of both."
                  value={objective}
                  onChange={(value) => setObjective(value as PortfolioObjective)}
                  items={[
                    ["dividend-income", "Dividend paying"],
                    ["capital-growth", "Capital gain"],
                    ["income-and-growth", "Dividend & capital"],
                  ]}
                  columnsClassName="sm:grid-cols-3"
                />

                <div className="rounded-[1.6rem] border bg-card/70 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Holdings
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Choose how many names you want in the suggested basket.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
                    {HOLDING_OPTIONS.map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setHoldings(count)}
                        className={cn(
                          "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                          holdings === count
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 shadow-soft dark:text-emerald-200"
                            : "bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                        )}
                      >
                        {count} stocks
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-200">
                        What Stockli will prefer
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Stronger earnings, cleaner cash flow, manageable debt, larger franchise quality,
                        and sectors where more than one company looks investable.
                      </p>
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="h-12 gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-300 hover:text-white"
                    >
                      {resource.isRefreshing ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Target className="size-4" />
                      )}
                      Suggest portfolio
                    </Button>
                  </div>
                </div>
              </div>
            </form>

            <div className="grid gap-4 sm:grid-cols-2">
              <SummaryBlurb
                icon={<Wallet className="size-5" />}
                eyebrow="Core stability"
                title="Blue-chip anchors"
                copy="Larger, steadier companies with healthier cash flow, debt control and market scale get priority as the core of the basket."
              />
              <SummaryBlurb
                icon={<ShieldCheck className="size-5" />}
                eyebrow="Sector backdrop"
                title="Growing sectors first"
                copy="The shortlist now leans toward sectors where multiple companies are scoring well instead of isolated one-name stories."
              />
              <SummaryBlurb
                icon={<BarChart3 className="size-5" />}
                eyebrow="Quality filter"
                title="Fundamentals before momentum"
                copy="A fast price move alone is not enough. Weak yearly fundamentals are pushed back even if the chart looks exciting."
              />
              <SummaryBlurb
                icon={<Brain className="size-5" />}
                eyebrow="AI guidance"
                title="AI first, numbers underneath"
                copy="Stockli asks AI to explain the shortlist first. If the model is busy, the page falls back to the same numbers-backed read."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {resource.isLoading ? (
        <PortfolioLoading />
      ) : portfolio ? (
        <>
          <Card variant="feature" className="overflow-hidden">
            <CardContent className="space-y-6 p-5 sm:p-6">
              <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-[2rem] border bg-background/90 p-5 shadow-soft">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="success">{humanObjective(portfolio.objective)}</Badge>
                    <Badge variant="outline">{humanDuration(portfolio.duration)}</Badge>
                    <Badge variant="outline">{portfolio.holdingsRequested} holdings</Badge>
                  </div>
                  <h2 className="mt-4 text-3xl font-bold tracking-tight">
                    Portfolio score {portfolio.score}/100
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{portfolio.summary}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <MiniStat label="Expected annual return" value={`${portfolio.expectedAnnualReturn.toFixed(1)}%`} tone="gain" />
                    <MiniStat label="Sectors covered" value={String(portfolio.sectorsCovered)} />
                    <MiniStat
                      label="Dividend yield"
                      value={portfolio.expectedDividendYield == null ? "—" : `${portfolio.expectedDividendYield.toFixed(1)}%`}
                    />
                  </div>
                  <div className="mt-4 rounded-[1.6rem] border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-200">
                      Estimated return range
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <MiniStat label="Low" value={`${portfolio.expectedRange.low.toFixed(1)}%`} />
                      <MiniStat label="Base" value={`${portfolio.expectedRange.base.toFixed(1)}%`} tone="gain" />
                      <MiniStat label="High" value={`${portfolio.expectedRange.high.toFixed(1)}%`} />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {portfolio.scoreBreakdown.map((item, index) => (
                    <BreakdownCard
                      key={item.label}
                      label={item.label}
                      score={item.score}
                      color={CHART_COLORS[index % CHART_COLORS.length] ?? "#10b981"}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-start gap-3">
              <div className="rounded-2xl bg-violet-500/10 p-3 text-violet-600 dark:text-violet-300">
                <Brain className="size-5" />
              </div>
              <div>
                <CardTitle>AI portfolio read</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Stockli asks AI to explain the shortlist first, then falls back to the same
                  numbers-backed view if the model is busy.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {aiInsight ? <Badge variant="violet">{aiInsight.confidence} confidence</Badge> : null}
                <Badge variant="success">{humanObjective(portfolio.objective)}</Badge>
                <Button type="button" variant="outline" size="sm" onClick={refresh}>
                  Refresh summary
                </Button>
              </div>

              {aiLoading && !aiData ? (
                <PortfolioAiLoading />
              ) : aiInsight ? (
                <div className="space-y-4">
                  {aiError ? (
                    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-200">
                      AI summary is taking a little longer right now. Stockli is showing the
                      numbers-backed read for the moment.
                    </div>
                  ) : null}
                  <div className="rounded-[1.8rem] border border-violet-500/20 bg-violet-500/5 p-5">
                    <h3 className="text-2xl font-semibold">{aiInsight.headline}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{aiInsight.summary}</p>
                  </div>
                  <div className="grid gap-4 xl:grid-cols-3">
                    <InsightCard title="Why this portfolio fits" items={aiInsight.portfolioFit} tone="success" />
                    <InsightCard
                      title="What stands out in the picks"
                      items={aiInsight.holdingCalls.map((item) => `${item.symbol}: ${item.note}`)}
                      tone="info"
                    />
                    <InsightCard title="What to watch" items={aiInsight.watchouts} tone="warning" />
                  </div>
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm leading-7 text-foreground/90">
                    <p className="font-semibold text-emerald-700 dark:text-emerald-200">AI suggestion</p>
                    <p className="mt-2">{aiInsight.suggestion}</p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
            <Card>
              <CardHeader className="flex-row items-start gap-3">
                <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-600 dark:text-sky-300">
                  <BarChart3 className="size-5" />
                </div>
                <div>
                  <CardTitle>Allocation by stock</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Higher weights go to the stronger overall ideas in this mix.
                  </p>
                </div>
              </CardHeader>
              <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={portfolio.holdings}
                    margin={{ top: 12, right: 8, left: -18, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.16)" />
                    <XAxis dataKey="symbol" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} />
                    <Tooltip content={<AllocationTooltip />} cursor={{ fill: "rgba(14,165,233,0.08)" }} />
                    <Bar dataKey="weight" radius={[10, 10, 0, 0]}>
                      {portfolio.holdings.map((holding, index) => (
                        <Cell key={holding.symbol} fill={CHART_COLORS[index % CHART_COLORS.length] ?? "#10b981"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-start gap-3">
                <div className="rounded-2xl bg-violet-500/10 p-3 text-violet-600 dark:text-violet-300">
                  <PieChart className="size-5" />
                </div>
                <div>
                  <CardTitle>Sector mix</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This is where the diversification is coming from.
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {portfolio.sectorMix.map((sector, index) => (
                  <div key={sector.sector} className="rounded-[1.4rem] border bg-background/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{sector.sector}</p>
                        <p className="text-sm text-muted-foreground">
                          {sector.holdings} holding{sector.holdings === 1 ? "" : "s"}
                        </p>
                      </div>
                      <Badge variant="outline">{sector.weight.toFixed(1)}%</Badge>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${sector.weight}%`,
                          backgroundColor: CHART_COLORS[index % CHART_COLORS.length] ?? "#10b981",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex-row items-start gap-3">
              <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-300">
                <Target className="size-5" />
              </div>
              <div>
                <CardTitle>Suggested holdings</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Each pick shows its role in the basket, expected return, and the main reasons it made the cut.
                </p>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 xl:grid-cols-2">
              {portfolio.holdings.map((holding) => (
                <HoldingCard key={holding.symbol} holding={holding} />
              ))}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}

function ToggleGroup({
  label,
  description,
  value,
  onChange,
  items,
  columnsClassName,
}: {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  items: Array<[string, string]>;
  columnsClassName?: string;
}) {
  return (
    <div className="rounded-[1.6rem] border bg-card/70 p-4">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      {description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p> : null}
      <div className={cn("mt-4 grid gap-2", columnsClassName)}>
        {items.map(([itemValue, itemLabel]) => (
          <button
            key={itemValue}
            type="button"
            onClick={() => onChange(itemValue)}
            className={cn(
              "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
              value === itemValue
                ? "border-violet-500/40 bg-violet-500/10 text-violet-700 shadow-soft dark:text-violet-200"
                : "bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground"
            )}
          >
            {itemLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

function BreakdownCard({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  return (
    <div className="rounded-[1.8rem] border bg-background/90 p-5 shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold">{score}/100</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function SummaryBlurb({
  icon,
  eyebrow,
  title,
  copy,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-[1.8rem] border bg-background/90 p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="rounded-[1.35rem] bg-violet-500/10 p-3 text-violet-600 dark:text-violet-300">
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">
            {eyebrow}
          </p>
          <p className="mt-1 text-lg font-semibold">{title}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">{copy}</p>
    </div>
  );
}

function HoldingCard({
  holding,
}: {
  holding: SuggestedPortfolio["holdings"][number];
}) {
  return (
    <div className="rounded-[1.8rem] border bg-background/90 p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Rank #{holding.rank}
          </p>
          <h3 className="mt-2 text-2xl font-bold">{holding.symbol}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{holding.name}</p>
        </div>
        <div className="rounded-[1.4rem] border bg-card px-4 py-3 text-center shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Weight
          </p>
          <p className="mt-2 text-3xl font-bold">{holding.weight.toFixed(1)}%</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="violet">{holding.portfolioRole}</Badge>
        <Badge variant="info">{holding.sector}</Badge>
        <Badge variant="success">Score {holding.portfolioScore}/100</Badge>
        <Badge variant="outline">{holding.expectedAnnualReturn.toFixed(1)}% est. return</Badge>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {holding.highlights.map((highlight) => (
          <div key={`${holding.symbol}-${highlight.label}`} className="rounded-2xl border bg-card/70 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              {highlight.label}
            </p>
            <p className="mt-2 text-lg font-semibold">{highlight.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {holding.reasons.map((reason, index) => (
          <div key={`${holding.symbol}-${index}`} className="flex gap-2 text-sm leading-6 text-muted-foreground">
            <span className="mt-2 size-2 shrink-0 rounded-full bg-emerald-500" />
            <span>{reason}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "gain" | "loss";
}) {
  return (
    <div className="rounded-2xl border bg-card/70 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-lg font-semibold",
          tone === "gain" && "text-gain",
          tone === "loss" && "text-loss"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function InsightCard({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "success" | "info" | "warning";
}) {
  return (
    <div
      className={cn(
        "rounded-[1.6rem] border p-4",
        tone === "success" && "border-emerald-500/20 bg-emerald-500/5",
        tone === "info" && "border-sky-500/20 bg-sky-500/5",
        tone === "warning" && "border-amber-500/20 bg-amber-500/5"
      )}
    >
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-3 space-y-2">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="flex gap-2 text-sm leading-6 text-muted-foreground">
            <span
              className={cn(
                "mt-2 size-2 shrink-0 rounded-full",
                tone === "success" && "bg-emerald-500",
                tone === "info" && "bg-sky-500",
                tone === "warning" && "bg-amber-500"
              )}
            />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PortfolioLoading() {
  const steps = [
    "Pulling the scored fundamentals universe",
    "Filtering candidates for your goal and duration",
    "Spreading the shortlist across sectors",
    "Building weights, return range and notes",
  ];

  return (
    <Card>
      <CardContent className="space-y-4 p-8">
        <div className="flex items-center gap-3">
          <Loader2 className="size-5 animate-spin text-emerald-500" />
          <div>
            <p className="text-lg font-semibold">Building your portfolio</p>
            <p className="text-sm text-muted-foreground">
              Stockli is ranking the ready fundamentals and assembling the shortlist.
            </p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {steps.map((step, index) => (
            <div key={step} className="rounded-2xl border bg-background/80 p-4">
              <p className="text-sm font-semibold text-foreground">Step {index + 1}</p>
              <p className="mt-1 text-sm text-muted-foreground">{step}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PortfolioAiLoading() {
  return (
    <div className="rounded-[1.8rem] border bg-background/80 p-5">
      <div className="flex items-center gap-3">
        <Loader2 className="size-5 animate-spin text-violet-500" />
        <div>
          <p className="font-semibold">Writing the AI portfolio summary</p>
          <p className="text-sm text-muted-foreground">
            The model is reading the holdings, weights, diversification and projected return range.
          </p>
        </div>
      </div>
    </div>
  );
}

function AllocationTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload?: SuggestedPortfolio["holdings"][number];
  }>;
}) {
  if (!active || !payload?.[0]?.payload) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-xl border bg-background/95 px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold">{item.symbol}</p>
      <p className="text-muted-foreground">{item.weight.toFixed(1)}% allocation</p>
      <p className="text-muted-foreground">{item.expectedAnnualReturn.toFixed(1)}% expected annual return</p>
    </div>
  );
}

function usePostJson<T>(url: string, body: Record<string, unknown> | null) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [cache, setCache] = React.useState<{ status: string; storedAt: string } | null>(null);

  const run = React.useCallback(async () => {
    if (!body) {
      setData(null);
      setCache(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json().catch(() => null)) as
        | { data?: T; cache?: { status: string; storedAt: string }; error?: string }
        | null;
      if (!response.ok || !payload?.data) {
        throw new Error(payload?.error ?? `Request failed: ${response.status}`);
      }
      setData(payload.data);
      setCache(payload.cache ?? null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  }, [body, url]);

  React.useEffect(() => {
    void run();
  }, [run]);

  return { data, loading, error, cache, refresh: run };
}

function humanDuration(duration: PortfolioDuration) {
  return duration === "long-term" ? "Long term" : "Short term";
}

function humanObjective(objective: PortfolioObjective) {
  if (objective === "dividend-income") return "Dividend paying";
  if (objective === "capital-growth") return "Capital gain";
  return "Dividend & capital";
}
