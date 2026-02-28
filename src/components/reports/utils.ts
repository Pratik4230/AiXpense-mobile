export function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
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
