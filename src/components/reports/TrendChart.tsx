import { View, useColorScheme } from "react-native";
import { Card, Skeleton } from "heroui-native";
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
}

export function TrendChart({ data, isLoading, range, mode }: Props) {
  const isDark = useColorScheme() === "dark";

  const chartData = (data ?? []).map((p) => ({
    value: p.total,
    label: formatLabel(p, range),
    frontColor: isDark ? "#f97316" : "#ea580c",
  }));

  return (
    <Card className="p-4">
      <Card.Title className="text-sm font-semibold mb-3">
        {mode === "expense" ? "Spending Trend" : "Income Trend"}
      </Card.Title>
      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-lg" />
      ) : chartData.length === 0 ? (
        <View className="h-48 items-center justify-center">
          <Card.Description>No data for this period</Card.Description>
        </View>
      ) : (
        <BarChart
          data={chartData}
          width={280}
          height={180}
          barWidth={range === "1m" ? 8 : 22}
          spacing={range === "1m" ? 6 : 14}
          noOfSections={4}
          barBorderTopLeftRadius={4}
          barBorderTopRightRadius={4}
          xAxisColor={isDark ? "#27272a" : "#e4e4e7"}
          yAxisColor={isDark ? "#27272a" : "#e4e4e7"}
          yAxisTextStyle={{
            fontSize: 10,
            color: isDark ? "#71717a" : "#a1a1aa",
          }}
          xAxisLabelTextStyle={{
            fontSize: 9,
            color: isDark ? "#71717a" : "#a1a1aa",
          }}
          hideRules
          isAnimated
          animationDuration={600}
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
