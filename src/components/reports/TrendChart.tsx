import { memo, useMemo } from "react";
import { View, Platform, useColorScheme } from "react-native";
import { Card, Skeleton, useThemeColor } from "heroui-native";
import { BarChart } from "react-native-gifted-charts";
import { MONTH_NAMES } from "./utils";
import type { TrendPoint, ReportRange, ReportMode } from "@/services/reports";

function formatLabel(point: TrendPoint, range: ReportRange): string {
  if (range === "1m") {
    return `${point._id.day}`;
  }
  return MONTH_NAMES[(point._id.month ?? 1) - 1];
}

interface Props {
  data?: TrendPoint[];
  isLoading: boolean;
  range: ReportRange;
  mode: ReportMode;
  chartWidth: number;
}

function TrendChartInner({
  data,
  isLoading,
  range,
  mode,
  chartWidth,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const [accentColor] = useThemeColor(["accent"]);

  const axisColor = isDark ? "#27272a" : "#e4e4e7";
  const labelMuted = isDark ? "#71717a" : "#a1a1aa";

  const chartData = useMemo(
    () =>
      (data ?? []).map((p) => ({
        value: p.total,
        label: formatLabel(p, range),
        frontColor: accentColor,
      })),
    [data, range, accentColor],
  );

  const barWidth = Math.max(
    6,
    range === "1m" ? 10 : Math.min(24, Math.floor(chartWidth / 14)),
  );
  const spacing = range === "1m" ? 6 : 12;

  return (
    <Card className="p-4 rounded-3xl border border-separator overflow-hidden">
      <Card.Title className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
        {mode === "expense" ? "Spending trend" : "Income trend"}
      </Card.Title>
      <Card.Description className="text-xs text-muted mb-3">
        {range === "1m" ? "Daily totals" : "Monthly totals"}
      </Card.Description>
      {isLoading ? (
        <Skeleton className="h-[200px] w-full rounded-2xl" />
      ) : chartData.length === 0 ? (
        <View className="h-[200px] items-center justify-center rounded-2xl border border-dashed border-separator bg-surface/50">
          <Card.Description className="text-sm text-muted text-center px-4">
            No data for this period
          </Card.Description>
        </View>
      ) : (
        <BarChart
          data={chartData}
          width={chartWidth}
          height={188}
          barWidth={barWidth}
          spacing={spacing}
          noOfSections={4}
          barBorderTopLeftRadius={6}
          barBorderTopRightRadius={6}
          xAxisColor={axisColor}
          yAxisColor={axisColor}
          yAxisTextStyle={{
            fontSize: 10,
            color: labelMuted,
          }}
          xAxisLabelTextStyle={{
            fontSize: 9,
            color: labelMuted,
          }}
          hideRules
          isAnimated={Platform.OS === "ios"}
          animationDuration={320}
          yAxisLabelPrefix="₹"
          formatYLabel={(v) => {
            const num = Number(v);
            return num >= 1000 ? `${(num / 1000).toFixed(0)}k` : v;
          }}
        />
      )}
    </Card>
  );
}

export const TrendChart = memo(TrendChartInner);
