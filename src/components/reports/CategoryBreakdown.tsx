import { View, useColorScheme, Text } from "react-native";
import { Card, Skeleton } from "heroui-native";
import { PieChart } from "react-native-gifted-charts";
import { CHART_COLORS, fmt } from "./utils";
import type { CategoryPoint } from "@/services/reports";

interface Props {
  data?: CategoryPoint[];
  isLoading: boolean;
}

export function CategoryBreakdown({ data, isLoading }: Props) {
  const isDark = useColorScheme() === "dark";

  const total = (data ?? []).reduce((s, item) => s + item.total, 0);

  const pieData = (data ?? []).slice(0, 8).map((item, i) => ({
    value: item.total,
    color: CHART_COLORS[i % CHART_COLORS.length],
    text: `${total > 0 ? ((item.total / total) * 100).toFixed(0) : 0}%`,
    textColor: isDark ? "#fafafa" : "#18181b",
    label: item._id.charAt(0).toUpperCase() + item._id.slice(1),
  }));

  return (
    <Card className="p-4">
      <Card.Title className="text-sm font-semibold mb-3">
        Category Breakdown
      </Card.Title>
      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-lg" />
      ) : pieData.length === 0 ? (
        <View className="h-48 items-center justify-center">
          <Card.Description>No data for this period</Card.Description>
        </View>
      ) : (
        <View className="items-center">
          <PieChart
            data={pieData}
            donut
            innerRadius={50}
            radius={75}
            innerCircleColor={isDark ? "#18181b" : "#ffffff"}
            centerLabelComponent={() => (
              <View className="items-center">
                <Text
                  className="text-xs text-muted"
                  style={{ color: isDark ? "#71717a" : "#a1a1aa" }}
                >
                  Total
                </Text>
                <Text
                  className="text-sm font-bold"
                  style={{ color: isDark ? "#fafafa" : "#18181b" }}
                >
                  {fmt(total)}
                </Text>
              </View>
            )}
            isAnimated
            animationDuration={600}
          />
          <View className="flex-row flex-wrap gap-x-4 gap-y-2 mt-4 justify-center">
            {pieData.map((item, i) => (
              <View key={i} className="flex-row items-center gap-1.5">
                <View
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <Text
                  className="text-xs"
                  style={{ color: isDark ? "#a1a1aa" : "#71717a" }}
                >
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Card>
  );
}
