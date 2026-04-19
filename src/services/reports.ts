import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type ReportRange = "1m" | "3m" | "6m" | "1y";
export type ReportMode = "expense" | "income";

export interface OverviewData {
  total: number;
  count: number;
  change: number;
  topCategory: string | null;
  topCategoryAmount: number;
  largestExpense: number;
}

export interface TrendPoint {
  _id: { year: number; month?: number; week?: number; day?: number };
  total: number;
  count: number;
}

export interface CategoryPoint {
  _id: string;
  total: number;
  count: number;
}

export interface BudgetVsActualPoint {
  category: string;
  budget: number;
  spent: number;
}

export interface TopExpense {
  _id: string;
  item: string;
  amount: number;
  category: string;
  date: string;
}

export interface ReportsResponse {
  overview: OverviewData;
  trend: TrendPoint[];
  categories: CategoryPoint[];
  budgetVsActual: BudgetVsActualPoint[] | null;
  topExpenses: TopExpense[];
}

const STALE_MS = 1000 * 60 * 5;

/**
 * Single request for the reports dashboard. Avoids duplicate observers and
 * prevents fetching expense data while the Income tab is active.
 */
export function useReportData(range: ReportRange, mode: ReportMode) {
  return useQuery<ReportsResponse>({
    queryKey: ["reports", range, mode],
    queryFn: () =>
      api
        .get<ReportsResponse>(`/api/reports?range=${range}&mode=${mode}`)
        .then((r) => r.data),
    staleTime: STALE_MS,
  });
}
