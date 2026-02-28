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

function reportsQuery<T>(type: string, range: ReportRange, mode: ReportMode) {
  return {
    queryKey: ["reports", type, range, mode],
    queryFn: () =>
      api
        .get<T>(`/api/reports?type=${type}&range=${range}&mode=${mode}`)
        .then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  };
}

export function useReportOverview(range: ReportRange, mode: ReportMode) {
  return useQuery<OverviewData>(reportsQuery("overview", range, mode));
}

export function useReportTrend(range: ReportRange, mode: ReportMode) {
  return useQuery<TrendPoint[]>(reportsQuery("trend", range, mode));
}

export function useReportCategories(range: ReportRange, mode: ReportMode) {
  return useQuery<CategoryPoint[]>(reportsQuery("categories", range, mode));
}

export function useReportBudgetVsActual(range: ReportRange) {
  return useQuery<BudgetVsActualPoint[]>({
    queryKey: ["reports", "budget-vs-actual", range],
    queryFn: () =>
      api
        .get<
          BudgetVsActualPoint[]
        >(`/api/reports?type=budget-vs-actual&range=${range}&mode=expense`)
        .then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });
}

export function useReportTopExpenses(range: ReportRange, mode: ReportMode) {
  return useQuery<TopExpense[]>(reportsQuery("top-expenses", range, mode));
}
