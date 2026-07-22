"use client";

import * as React from "react";

export { ChartSwitchLoader } from "@/components/charts/chart-switch-loader";

/** Shows a loader immediately when the chart symbol changes, until new data is ready. */
export function useChartSwitchLoader(symbol: string, data: unknown, isLoading: boolean) {
  const [chartReadyFor, setChartReadyFor] = React.useState<string | null>(null);

  React.useEffect(() => {
    setChartReadyFor(null);
  }, [symbol]);

  React.useEffect(() => {
    if (data != null && !isLoading) {
      setChartReadyFor(symbol);
    }
  }, [data, isLoading, symbol]);

  const showLoader = chartReadyFor !== symbol || isLoading || data == null;

  const beginSwitch = React.useCallback(() => {
    setChartReadyFor(null);
  }, []);

  return { showLoader, beginSwitch };
}
