import { getPortfolioPerformance } from "@/lib/services/performance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PerformanceChart } from "@/components/charts/performance-chart";
import { TopHoldingsByShares } from "@/components/dashboard/top-holdings-by-shares";
import { Skeleton } from "@/components/ui/skeleton";
import type { PortfolioPerformanceInput } from "@/lib/services/performance";
import type { HoldingWithMetrics } from "@/lib/types";

/**
 * Async server component for the (slow) performance chart. Rendered inside a
 * <Suspense> boundary so the rest of the dashboard paints immediately and this
 * streams in once the EOD history is ready.
 */
export async function PerformanceSection({
  portfolios,
  holdings,
}: {
  portfolios: PortfolioPerformanceInput[];
  holdings: HoldingWithMetrics[];
}) {
  const performance = await getPortfolioPerformance(portfolios);
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Your Portfolios vs KSE-100 returns</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Compare each day&apos;s KSE-100 return with every Portfolio&apos;s daily return.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <PerformanceChart data={performance} />
        <TopHoldingsByShares holdings={holdings} />
      </CardContent>
    </Card>
  );
}

export function PerformanceSkeleton() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Your Portfolios vs KSE-100 returns</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-[280px] items-end gap-1.5">
          {Array.from({ length: 28 }).map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-sm"
              style={{ height: `${30 + ((i * 37) % 60)}%` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
