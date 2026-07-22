"use client";

import * as React from "react";
import { LineChart } from "lucide-react";
import { PriceLineChart } from "@/components/charts/price-line-chart";
import { IconChip } from "@/components/ui/accent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartSwitchLoader, useChartSwitchLoader } from "@/lib/hooks/use-chart-switch-loader";
import { usePersistentResource } from "@/lib/hooks/use-persistent-resource";
import type { HistoryPoint } from "@/app/api/public/yahoo-history/route";
import type { GlobalMarketQuote } from "@/lib/services/global-markets";

export interface UsMarketChartHandle {
  refresh(): Promise<void>;
}

function formatUsPrice(price: number) {
  if (price >= 1000) return price.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (price >= 1) return price.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return price.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

export const UsMarketChart = React.forwardRef<
  UsMarketChartHandle,
  { quotes: GlobalMarketQuote[] }
>(function UsMarketChart({ quotes }, ref) {
  const options = React.useMemo(
    () =>
      quotes
        .filter((q) => q.symbol)
        .map((q) => ({
          symbol: q.symbol,
          name: q.name,
          type: q.type,
          currency: q.currency ?? "USD",
        })),
    [quotes]
  );

  const defaultSymbol = options.find((o) => o.symbol === "^GSPC")?.symbol ?? options[0]?.symbol ?? "^GSPC";
  const [symbol, setSymbol] = React.useState(defaultSymbol);

  React.useEffect(() => {
    if (!options.some((o) => o.symbol === symbol) && options[0]) {
      setSymbol(options[0].symbol);
    }
  }, [options, symbol]);

  const { data, isLoading, refreshNow } = usePersistentResource<HistoryPoint[]>({
    cacheKey: `public:yahoo-history-v1:${symbol}`,
    url: `/api/public/yahoo-history?symbol=${encodeURIComponent(symbol)}`,
    refreshInterval: 60 * 60 * 1000,
    keepPreviousData: false,
  });

  const { showLoader, beginSwitch } = useChartSwitchLoader(symbol, data, isLoading);

  React.useImperativeHandle(ref, () => ({
    refresh: () => refreshNow().then(() => undefined),
  }), [refreshNow]);

  const active = options.find((o) => o.symbol === symbol) ?? options[0];

  const handleSymbolChange = (next: string) => {
    if (next === symbol) return;
    beginSwitch();
    setSymbol(next);
  };

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <IconChip accent="sky" variant="gradient"><LineChart /></IconChip>
            <div>
              <CardTitle>Price chart</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Yahoo Finance delayed chart data
              </p>
            </div>
          </div>
          <Select value={symbol} onValueChange={handleSymbolChange}>
            <SelectTrigger className="w-full sm:w-72">
              <SelectValue placeholder="Select market or stock" />
            </SelectTrigger>
            <SelectContent>
              {options.map((item) => (
                <SelectItem key={item.symbol} value={item.symbol}>
                  {item.name} · {item.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {showLoader ? (
          <ChartSwitchLoader
            label={`${active?.name ?? symbol} chart`}
            accentClassName="border-sky-500/30 border-t-sky-500"
            className="h-[320px]"
          />
        ) : !data || data.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Chart data unavailable for {active?.name ?? symbol}
          </p>
        ) : (
          <PriceLineChart
            key={symbol}
            data={data}
            color="hsl(199 89% 48%)"
            height={280}
            unit={active?.currency === "USD" ? "$" : `${active?.currency ?? ""} `}
            label={`${active?.name ?? symbol}${active?.currency ? ` (${active.currency})` : ""}`}
            formatPrice={formatUsPrice}
            defaultDuration="1Y"
          />
        )}
      </CardContent>
    </Card>
  );
});
