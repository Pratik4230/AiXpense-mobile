import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { issuesService, ReportIssuePayload } from "@/services/issues";

export type { MyIssueItem } from "@/services/issues";

export function useMyIssues(page = 1) {
  return useQuery({
    queryKey: ["my-issues", page],
    queryFn: () => issuesService.getMyIssues(page),
  });
}

export function useReportIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReportIssuePayload) => issuesService.reportIssue(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-issues"] });
    },
  });
}
