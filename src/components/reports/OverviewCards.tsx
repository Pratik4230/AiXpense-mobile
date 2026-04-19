import { memo, useMemo } from "react";
import { View } from "react-native";
import { Card, Skeleton, useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";

import { fmt } from "./utils";
import type { OverviewData, ReportMode } from "@/services/reports";

interface Props {
  data?: OverviewData;
  isLoading: boolean;
  mode: ReportMode;
}

function OverviewCardsInner({ data, isLoading, mode }: Props) {
  const [dangerColor, successColor, mutedColor] = useThemeColor([
    "danger",
    "success",
    "muted",
  ]);

  const isExpense = mode === "expense";
  const change = data?.change ?? 0;

  const { trendIcon, trendColor } = useMemo(() => {
    const icon =
      change > 0 ? "trending-up" : change < 0 ? "trending-down" : "remove";
    let color = mutedColor;
    if (isExpense) {
      if (change > 0) color = dangerColor;
      else if (change < 0) color = successColor;
    } else {
      if (change > 0) color = successColor;
      else if (change < 0) color = dangerColor;
    }
    return { trendIcon: icon, trendColor: color };
  }, [
    change,
    isExpense,
    dangerColor,
    successColor,
    mutedColor,
  ]);

  const cards = useMemo(
    () => [
      {
        label: isExpense ? "Total spent" : "Total earned",
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
        sub: "This period",
        subColor: mutedColor,
      },
      {
        label: isExpense ? "Top category" : "Top source",
        value: data?.topCategory
          ? data.topCategory.charAt(0).toUpperCase() +
            data.topCategory.slice(1)
          : "—",
        icon: "pricetag-outline" as const,
        sub: fmt(data?.topCategoryAmount ?? 0),
        subColor: mutedColor,
      },
      {
        label: isExpense ? "Largest expense" : "Largest income",
        value: fmt(data?.largestExpense ?? 0),
        icon: "arrow-up-outline" as const,
        sub: "Single transaction",
        subColor: mutedColor,
      },
    ],
    [data, isExpense, change, trendColor, trendIcon, mutedColor],
  );

  if (isLoading) {
    return (
      <View className="flex-row flex-wrap gap-3">
        {[0, 1, 2, 3].map((i) => (
          <View key={i} className="w-[48%]">
            <Skeleton className="h-[104px] w-full rounded-3xl" />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap gap-3">
      {cards.map((c) => (
        <View key={c.label} className="w-[48%]">
          <Card className="p-3.5 rounded-3xl border border-separator overflow-hidden">
            <View className="flex-row items-center justify-between mb-2">
              <Card.Description className="text-[11px] font-medium uppercase tracking-wide text-muted">
                {c.label}
              </Card.Description>
              <Ionicons name={c.icon} size={15} color={mutedColor} />
            </View>
            <Card.Title className="text-lg font-bold mb-1.5 text-foreground tracking-tight">
              {c.value}
            </Card.Title>
            <View className="flex-row items-center gap-1 flex-wrap">
              {c.subIcon && (
                <Ionicons name={c.subIcon} size={12} color={c.subColor} />
              )}
              <Card.Description
                className="text-[11px] font-medium"
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

export const OverviewCards = memo(OverviewCardsInner);
