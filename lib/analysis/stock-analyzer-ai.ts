export const STOCK_ANALYZER_AI_MODELS = ["glm-4.7-flash", "glm-4.5-flash"] as const;

export type StockAnalyzerAiModel = (typeof STOCK_ANALYZER_AI_MODELS)[number];

export type StockAnalyzeAiInsight = {
  headline: string;
  summary: string;
  strengths: string[];
  risks: string[];
  valuationView: string;
  dividendView: string;
  suggestion: string;
  confidence: "high" | "medium" | "low";
};

export type StockCompareAiInsight = {
  winner: string;
  summary: string;
  whyWinner: string[];
  firstStrengths: string[];
  secondStrengths: string[];
  watchouts: string[];
  suggestion: string;
  confidence: "high" | "medium" | "low";
};
