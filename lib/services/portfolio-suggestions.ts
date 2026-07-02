import "server-only";

import {
  buildPortfolioSuggestion,
  PORTFOLIO_DURATIONS,
  PORTFOLIO_OBJECTIVES,
  type PortfolioDuration,
  type PortfolioObjective,
} from "@/lib/analysis/portfolio-suggestions";
import { getStaleCached } from "@/lib/cache/stale";
import { getSectorLeadersData } from "@/lib/services/sector-leaders";

const PORTFOLIO_SUGGESTION_TTL_SECONDS = 30 * 60;
const PORTFOLIO_SUGGESTION_STALE_SECONDS = 24 * 60 * 60;

export async function getPortfolioSuggestion({
  duration,
  objective,
  holdings,
}: {
  duration: PortfolioDuration;
  objective: PortfolioObjective;
  holdings: number;
}) {
  if (!PORTFOLIO_DURATIONS.includes(duration)) {
    throw new Error("Unsupported portfolio duration.");
  }
  if (!PORTFOLIO_OBJECTIVES.includes(objective)) {
    throw new Error("Unsupported portfolio objective.");
  }

  const safeHoldings = Math.min(Math.max(Math.round(holdings), 3), 12);
  return getStaleCached({
    key: `public:portfolio-suggestions:v5:${duration}:${objective}:${safeHoldings}`,
    ttlSeconds: PORTFOLIO_SUGGESTION_TTL_SECONDS,
    staleSeconds: PORTFOLIO_SUGGESTION_STALE_SECONDS,
    load: async () => {
      const sectorData = await getSectorLeadersData();
      return buildPortfolioSuggestion({
        dataset: sectorData.value,
        duration,
        objective,
        holdings: safeHoldings,
      });
    },
    isUsable: (value) => Boolean(value?.holdings?.length),
  });
}
