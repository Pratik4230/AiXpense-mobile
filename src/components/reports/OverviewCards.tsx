import { View, useColorScheme } from "react-native";
import { Card, Skeleton } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";

import { fmt } from "./utils";
import type { OverviewData, ReportMode } from "@/services/reports";

interface Props {
  data?: OverviewData;
  isLoading: boolean;
  mode: ReportMode;
}

export function OverviewCards({ data, isLoading, mode }: Props) {
  const isDark = useColorScheme() === "dark";

  if (isLoading) {
    return (
      <View className="flex-row flex-wrap gap-3">
        {[...Array(4)].map((_, i) => (
          <View key={i} className="w-[48%]">
            <Skeleton className="h-24 w-full rounded-xl" />
          </View>
        ))}
      </View>
    );
  }

  const change = data?.change ?? 0;
  const isExpense = mode === "expense";

  const trendIcon =
    change > 0 ? "trending-up" : change < 0 ? "trending-down" : "remove";

  const trendColor = isExpense
    ? change > 0
      ? "#ef4444"
      : change < 0
        ? "#10b981"
        : "#71717a"
    : change > 0
      ? "#10b981"
      : change < 0
        ? "#ef4444"
        : "#71717a";

  const cards = [
    {
      label: isExpense ? "Total Spent" : "Total Earned",
      value: fmt(data?.total ?? 0),
      icon: "wallet-outline" as const,
      sub: `${Math.abs(change)}% vs last period`,
      subColor: trendColor,
      subIcon: trendIcon as any,
    },
    {
      label: "Transactions",
      value: `${data?.count ?? 0}`,
      icon: "flash-outline" as const,
      sub: "this period",
      subColor: "#71717a",
    },
    {
      label: isExpense ? "Top Category" : "Top Source",
      value: data?.topCategory
        ? data.topCategory.charAt(0).toUpperCase() + data.topCategory.slice(1)
        : "---",
      icon: "pricetag-outline" as const,
      sub: fmt(data?.topCategoryAmount ?? 0),
      subColor: "#71717a",
    },
    {
      label: isExpense ? "Largest Expense" : "Largest Income",
      value: fmt(data?.largestExpense ?? 0),
      icon: "arrow-up-outline" as const,
      sub: "single transaction",
      subColor: "#71717a",
    },
  ];

  return (
    <View className="flex-row flex-wrap gap-3">
      {cards.map((c) => (
        <View key={c.label} className="w-[48%]">
          <Card className="p-3">
            <View className="flex-row items-center justify-between mb-2">
              <Card.Description className="text-xs">{c.label}</Card.Description>
              <Ionicons
                name={c.icon}
                size={14}
                color={isDark ? "#71717a" : "#a1a1aa"}
              />
            </View>
            <Card.Title className="text-lg font-bold mb-1">
              {c.value}
            </Card.Title>
            <View className="flex-row items-center gap-1">
              {c.subIcon && (
                <Ionicons name={c.subIcon} size={12} color={c.subColor} />
              )}
              <Card.Description
                className="text-xs"
                style={{ color: c.subColor }}
              >
                {c.sub}
              </Card.Description>
            </View>
          </Card>
        </View>
      ))}
    </View>
  );
}
