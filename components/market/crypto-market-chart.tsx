"use client";

import * as React from "react";
import { Bitcoin } from "lucide-react";
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
import { usePersistentResource } from "@/lib/hooks/use-persistent-resource";
import type { HistoryPoint } from "@/app/api/public/crypto-history/route";
import type { GlobalMarketQuote } from "@/lib/services/global-markets";

export interface CryptoMarketChartHandle {
  refresh(): Promise<void>;
}

function formatCryptoPrice(price: number) {
  if (price >= 1000) return price.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (price >= 1) return price.toLocaleString("en-US", { maximumFractionDigits: 4 });
  if (price >= 0.01) return price.toLocaleString("en-US", { maximumFractionDigits: 6 });
  return price.toLocaleString("en-US", { maximumFractionDigits: 8 });
}

export const CryptoMarketChart = React.forwardRef<
  CryptoMarketChartHandle,
  { coins: GlobalMarketQuote[] }
>(function CryptoMarketChart({ coins }, ref) {
  const options = React.useMemo(() => {
    const list = coins
      .filter((c) => c.symbol)
      .map((c) => ({ symbol: c.symbol.toUpperCase(), name: c.name }));
    if (!list.some((c) => c.symbol === "BTC")) {
      list.unshift({ symbol: "BTC", name: "Bitcoin" });
    }
    return list;
  }, [coins]);

  const [symbol, setSymbol] = React.useState("BTC");
  const [chartReadyFor, setChartReadyFor] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!options.some((o) => o.symbol === symbol) && options[0]) {
      setSymbol(options[0].symbol);
    }
  }, [options, symbol]);

  const { data, isLoading, refreshNow } = usePersistentResource<HistoryPoint[]>({
    cacheKey: `public:crypto-history-v1:${symbol}`,
    url: `/api/public/crypto-history?symbol=${symbol}`,
    refreshInterval: 60 * 60 * 1000,
    keepPreviousData: false,
  });

  React.useEffect(() => {
    setChartReadyFor(null);
  }, [symbol]);

  React.useEffect(() => {
    if (data && !isLoading) {
      setChartReadyFor(symbol);
    }
  }, [data, isLoading, symbol]);

  React.useImperativeHandle(ref, () => ({
    refresh: () => refreshNow().then(() => undefined),
  }), [refreshNow]);

  const active = options.find((o) => o.symbol === symbol) ?? options[0];
  const showLoader = chartReadyFor !== symbol || isLoading || !data;

  const handleSymbolChange = (next: string) => {
    if (next === symbol) return;
    setChartReadyFor(null);
    setSymbol(next);
  };

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <IconChip accent="violet" variant="gradient"><Bitcoin /></IconChip>
            <div>
              <CardTitle>Price chart</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Yahoo Finance delayed crypto history
              </p>
            </div>
          </div>
          <Select value={symbol} onValueChange={handleSymbolChange}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Select coin" />
            </SelectTrigger>
            <SelectContent>
              {options.map((coin) => (
                <SelectItem key={coin.symbol} value={coin.symbol}>
                  {coin.name} ({coin.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {showLoader ? (
          <div className="flex h-[320px] flex-col items-center justify-center gap-3 rounded-xl bg-muted/20">
            <div className="size-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
            <p className="text-sm text-muted-foreground">
              Loading {active?.name ?? symbol} chart…
            </p>
          </div>
        ) : data.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Chart data unavailable for {active?.symbol ?? symbol}
          </p>
        ) : (
          <PriceLineChart
            key={symbol}
            data={data}
            color="hsl(262 83% 58%)"
            height={280}
            unit="$"
            label={`${active?.name ?? symbol} (USD)`}
            formatPrice={formatCryptoPrice}
            defaultDuration="1Y"
          />
        )}
      </CardContent>
    </Card>
  );
});
