import type { Metadata } from "next";
import { PortfolioSuggestions } from "@/components/analysis/portfolio-suggestions";

export const metadata: Metadata = {
  title: "Portfolio Suggestions · Stockli",
  description:
    "Build a diversified PSX portfolio idea from cached fundamentals, sector rankings and plain-English AI notes.",
};

export default function PortfolioSuggestionsPage() {
  return <PortfolioSuggestions />;
}
