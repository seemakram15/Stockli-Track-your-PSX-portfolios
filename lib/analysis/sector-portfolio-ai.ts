import type { SuggestedPortfolio } from "@/lib/analysis/portfolio-suggestions";
import type { SectorLeaderboard } from "@/lib/analysis/sector-ranking";

export type SectorLeadersAiInsight = {
  headline: string;
  summary: string;
  winnerCalls: string[];
  trends: string[];
  watchouts: string[];
  suggestion: string;
  confidence: "high" | "medium" | "low";
};

export type PortfolioSuggestionAiInsight = {
  headline: string;
  summary: string;
  portfolioFit: string[];
  holdingCalls: Array<{
    symbol: string;
    note: string;
  }>;
  watchouts: string[];
  suggestion: string;
  confidence: "high" | "medium" | "low";
};

export function buildDeterministicSectorLeadersInsight(
  leaderboard: SectorLeaderboard
): SectorLeadersAiInsight {
  const leader = leaderboard.stocks[0];
  const runnerUp = leaderboard.stocks[1];
  const topCategory = leaderboard.categories[0];

  return {
    headline: leader
      ? `${leader.symbol} is leading ${leaderboard.sector} on the current sector checklist`
      : `${leaderboard.sector} leaders are preparing`,
    summary: leader
      ? `${leader.name} is sitting on ${leader.totalScore}/100 and leading ${leaderboard.stockCount} tracked stocks in ${leaderboard.sector}. The current template is leaning most on ${topCategory?.category?.toLowerCase() ?? "the available"} checks.`
      : `The sector ranking is waiting for enough ready fundamentals to score this group cleanly.`,
    winnerCalls: leaderboard.stocks.slice(0, 4).map((stock, index) => {
      const reason = stock.strongestMetrics.slice(0, 2).join(" and ");
      return `${index + 1}. ${stock.symbol} scores ${stock.totalScore}/100, helped most by ${reason || "its available factors"}.`;
    }),
    trends: leaderboard.categories.slice(0, 4).map((category) => {
      return `${category.category} is averaging ${category.score}/100 across this sector ranking.`;
    }),
    watchouts: [
      runnerUp
        ? `${runnerUp.symbol} is close enough to the leader that one strong result season could change the order quickly.`
        : `Some rankings may change as more fresh statements land in the cache.`,
      `The score is sector-relative, so compare these names against each other before comparing them with a different industry.`,
      `Missing specialised metrics are reweighted, not treated as zero, which keeps the ranking fairer but can reduce confidence for some names.`,
    ],
    suggestion: leader
      ? `Start with ${leader.symbol}, then compare it with the next two names in the leaderboard before making a final sector pick.`
      : `Wait for more cached fundamentals or open a different sector with more ready stocks.`,
    confidence:
      leaderboard.parametersReady >= 10 && leaderboard.stockCount >= 6
        ? "high"
        : leaderboard.stockCount >= 3
          ? "medium"
          : "low",
  };
}

export function buildDeterministicPortfolioSuggestionInsight(
  portfolio: SuggestedPortfolio
): PortfolioSuggestionAiInsight {
  return {
    headline: `This ${objectiveLabel(portfolio.objective)} portfolio scores ${portfolio.score}/100`,
    summary: portfolio.summary,
    portfolioFit: [
      `${portfolio.sectorsCovered} sectors are represented, which helps avoid putting the whole idea into one industry.`,
      `The current historical projection points to about ${portfolio.expectedAnnualReturn.toFixed(1)}% a year, built from past revenue, EPS and dividend behaviour.`,
      `${portfolio.holdings.filter((holding) => holding.portfolioRole === "Blue-chip anchor").length} blue-chip anchor${portfolio.holdings.filter((holding) => holding.portfolioRole === "Blue-chip anchor").length === 1 ? "" : "s"} help steady the mix while growth names push the upside.`,
    ],
    holdingCalls: portfolio.holdings.slice(0, 6).map((holding) => ({
      symbol: holding.symbol,
      note: `${holding.symbol} is here as a ${holding.portfolioRole.toLowerCase()} with ${holding.weight.toFixed(1)}% weight because it scores ${holding.portfolioScore}/100 and its strongest case is ${holding.reasons[1] ?? holding.reasons[0] ?? "the current factor setup"}.`,
    })),
    watchouts: portfolio.watchouts,
    suggestion:
      portfolio.duration === "long-term"
        ? `Use this basket as a research shortlist, refresh it after each result season, and trim any name whose fundamentals stop supporting the original thesis.`
        : `Use this basket as a shorter-list idea set, but keep checking earnings momentum and price action because leadership can rotate faster over a shorter horizon.`,
    confidence:
      portfolio.holdings.length >= 6 && portfolio.sectorsCovered >= 4
        ? "high"
        : portfolio.holdings.length >= 4
          ? "medium"
          : "low",
  };
}

function objectiveLabel(objective: SuggestedPortfolio["objective"]) {
  if (objective === "dividend-income") return "income-focused";
  if (objective === "capital-growth") return "capital-growth";
  return "income-and-growth";
}
