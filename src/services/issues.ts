import { api } from "@/lib/api";

export interface MyIssueItem {
  id: string;
  title: string;
  description: string;
  type: "bug" | "feature" | "other";
  status: "open" | "in_progress" | "resolved" | "closed";
  mediaUrls: string[];
  adminNote: string;
  createdAt: string;
}

export interface MyIssuesResponse {
  issues: MyIssueItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ReportIssuePayload {
  title: string;
  description: string;
  type: "bug" | "feature" | "other";
}

export const issuesService = {
  getMyIssues: (page = 1) =>
    api
      .get<MyIssuesResponse>("/api/issues", { params: { page } })
      .then((r) => r.data),

  reportIssue: (payload: ReportIssuePayload) =>
    api.post("/api/issues", { ...payload, mediaUrls: [], mediaFileIds: [] }).then((r) => r.data),
};
