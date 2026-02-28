import { View, Text, useColorScheme } from "react-native";
import { Card, Skeleton } from "heroui-native";
import { fmt } from "./utils";
import type { BudgetVsActualPoint } from "@/services/reports";

interface Props {
  data?: BudgetVsActualPoint[];
  isLoading: boolean;
}

export function BudgetVsActual({ data, isLoading }: Props) {
  const isDark = useColorScheme() === "dark";

  if (isLoading) {
    return (
      <Card className="p-4">
        <Card.Title className="text-sm font-semibold mb-3">
          Budget vs Actual
        </Card.Title>
        <View className="gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </View>
      </Card>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <Card className="p-4">
      <Card.Title className="text-sm font-semibold mb-3">
        Budget vs Actual
      </Card.Title>
      <View className="gap-4">
        {data.map((item) => {
          const pct = item.budget > 0 ? (item.spent / item.budget) * 100 : 0;
          const barColor =
            pct >= 100 ? "#ef4444" : pct >= 80 ? "#f59e0b" : "#10b981";
          const textColor = barColor;

          return (
            <View key={item.category} className="gap-1.5">
              <View className="flex-row items-center justify-between">
                <Text
                  className="text-sm font-medium capitalize"
                  style={{ color: isDark ? "#fafafa" : "#18181b" }}
                >
                  {item.category}
                </Text>
                <Text
                  className="text-xs font-semibold"
                  style={{ color: textColor }}
                >
                  {fmt(item.spent)} / {fmt(item.budget)}
                </Text>
              </View>
              <View
                className="h-2 w-full rounded-full overflow-hidden"
                style={{
                  backgroundColor: isDark ? "#27272a" : "#e4e4e7",
                }}
              >
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    backgroundColor: barColor,
                  }}
                />
              </View>
              <Text
                className="text-xs text-right"
                style={{ color: isDark ? "#71717a" : "#a1a1aa" }}
              >
                {pct.toFixed(1)}% used
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}
