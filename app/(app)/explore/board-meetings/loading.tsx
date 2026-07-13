import { PageLoadingState } from "@/components/loading/page-loading-state";

export default function BoardMeetingsLoading() {
  return <PageLoadingState message="Loading board meetings..." variant="list" />;
}
