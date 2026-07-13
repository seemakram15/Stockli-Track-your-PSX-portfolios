import { PageLoadingState } from "@/components/loading/page-loading-state";

export default function StockAnalyzerLoading() {
  return <PageLoadingState message="Loading stock analyzer..." variant="fundamentals" />;
}
