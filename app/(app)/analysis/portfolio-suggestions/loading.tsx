import { PageLoadingState } from "@/components/loading/page-loading-state";

export default function PortfolioSuggestionsLoading() {
  return <PageLoadingState message="Loading portfolio suggestions..." variant="list" />;
}
