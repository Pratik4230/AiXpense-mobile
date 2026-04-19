import { memo, useMemo, useCallback } from "react";
import { View, Text } from "react-native";
import { Card, Skeleton, useThemeColor } from "heroui-native";
import { PieChart } from "react-native-gifted-charts";
import { CHART_COLORS, fmt } from "./utils";
import type { CategoryPoint } from "@/services/reports";

interface Props {
  data?: CategoryPoint[];
  isLoading: boolean;
}

function CategoryBreakdownInner({ data, isLoading }: Props) {
  const [foregroundColor, backgroundColor] = useThemeColor([
    "foreground",
    "background",
  ]);

  const total = useMemo(
    () => (data ?? []).reduce((s, item) => s + item.total, 0),
    [data],
  );

  const pieData = useMemo(
    () =>
      (data ?? []).slice(0, 8).map((item, i) => ({
        value: item.total,
        color: CHART_COLORS[i % CHART_COLORS.length],
        text: `${total > 0 ? ((item.total / total) * 100).toFixed(0) : 0}%`,
        textColor: foregroundColor,
        label: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      })),
    [data, total, foregroundColor],
  );

  const centerLabel = useCallback(
    () => (
      <View className="items-center">
        <Text className="text-[11px] font-medium text-muted">Total</Text>
        <Text className="text-sm font-bold text-foreground mt-0.5">
          {fmt(total)}
        </Text>
      </View>
    ),
    [total],
  );

  return (
    <Card className="p-4 rounded-3xl border border-separator overflow-hidden">
      <Card.Title className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
        Category breakdown
      </Card.Title>
      <Card.Description className="text-xs text-muted mb-3">
        Share of spend by category (top 8)
      </Card.Description>
      {isLoading ? (
        <Skeleton className="h-[220px] w-full rounded-2xl" />
      ) : pieData.length === 0 ? (
        <View className="h-[220px] items-center justify-center rounded-2xl border border-dashed border-separator bg-surface/50">
          <Card.Description className="text-sm text-muted text-center px-4">
            No category data this period
          </Card.Description>
        </View>
      ) : (
        <View className="items-center">
          <PieChart
            data={pieData}
            donut
            innerRadius={52}
            radius={78}
            innerCircleColor={backgroundColor}
            centerLabelComponent={centerLabel}
            isAnimated={false}
          />
          <View className="flex-row flex-wrap gap-x-4 gap-y-2.5 mt-5 justify-center px-1">
            {pieData.map((item) => (
              <View
                key={item.label}
                className="flex-row items-center gap-2 max-w-[45%]"
              >
                <View
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <Text
                  className="text-xs text-muted shrink"
                  numberOfLines={1}
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

export const CategoryBreakdown = memo(CategoryBreakdownInner);
