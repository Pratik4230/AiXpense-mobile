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

interface ReportsResponse {
  overview: OverviewData;
  trend: TrendPoint[];
  categories: CategoryPoint[];
  budgetVsActual: BudgetVsActualPoint[] | null;
  topExpenses: TopExpense[];
}

function useReports(range: ReportRange, mode: ReportMode) {
  return useQuery<ReportsResponse>({
    queryKey: ["reports", range, mode],
    queryFn: () =>
      api
        .get<ReportsResponse>(`/api/reports?range=${range}&mode=${mode}`)
        .then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });
}

export function useReportOverview(range: ReportRange, mode: ReportMode) {
  const q = useReports(range, mode);
  return { ...q, data: q.data?.overview };
}

export function useReportTrend(range: ReportRange, mode: ReportMode) {
  const q = useReports(range, mode);
  return { ...q, data: q.data?.trend };
}

export function useReportCategories(range: ReportRange, mode: ReportMode) {
  const q = useReports(range, mode);
  return { ...q, data: q.data?.categories };
}

export function useReportBudgetVsActual(range: ReportRange) {
  const q = useReports(range, "expense");
  return { ...q, data: q.data?.budgetVsActual ?? undefined };
}

export function useReportTopExpenses(range: ReportRange, mode: ReportMode) {
  const q = useReports(range, mode);
  return { ...q, data: q.data?.topExpenses };
}
