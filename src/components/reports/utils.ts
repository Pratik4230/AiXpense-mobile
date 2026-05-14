/** Format a whole-number money amount for dashboards (matches prior INR 0 decimals). */
export function formatMoney(n: number, currencyCode: string): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(n);
}

export const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const CHART_COLORS = [
  "#ef4444",
  "#3b82f6",
  "#facc15",
  "#10b981",
  "#e879f9",
  "#f97316",
  "#22d3ee",
  "#ec4899",
  "#84cc16",
  "#6366f1",
];
