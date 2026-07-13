import { PageLoadingState } from "@/components/loading/page-loading-state";

export default function FundsBreakdownLoading() {
  return <PageLoadingState message="Loading funds breakdown..." variant="list" />;
}
