import { memo, useMemo } from "react";
import { View, Text } from "react-native";
import { Card, Skeleton, useThemeColor } from "heroui-native";
import { fmt } from "./utils";
import type { BudgetVsActualPoint } from "@/services/reports";

interface Props {
  data?: BudgetVsActualPoint[];
  isLoading: boolean;
}

function barTone(
  pct: number,
  danger: string,
  warning: string,
  success: string,
): string {
  if (pct >= 100) return danger;
  if (pct >= 80) return warning;
  return success;
}

function BudgetVsActualInner({ data, isLoading }: Props) {
  const [dangerColor, warningColor, successColor, trackColor] = useThemeColor([
    "danger",
    "warning",
    "success",
    "default",
  ]);

  const rows = useMemo(() => data ?? [], [data]);

  if (isLoading) {
    return (
      <Card className="p-4 rounded-3xl border border-separator overflow-hidden">
        <Card.Title className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
          Budget vs actual
        </Card.Title>
        <Card.Description className="text-xs text-muted mb-3">
          Spend compared to monthly budgets
        </Card.Description>
        <View className="gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[72px] w-full rounded-2xl" />
          ))}
        </View>
      </Card>
    );
  }

  if (!rows.length) return null;

  return (
    <Card className="p-4 rounded-3xl border border-separator overflow-hidden">
      <Card.Title className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
        Budget vs actual
      </Card.Title>
      <Card.Description className="text-xs text-muted mb-4">
        Spend compared to monthly budgets
      </Card.Description>
      <View className="gap-4">
        {rows.map((item) => {
          const pct = item.budget > 0 ? (item.spent / item.budget) * 100 : 0;
          const color = barTone(
            pct,
            dangerColor,
            warningColor,
            successColor,
          );

          return (
            <View key={item.category} className="gap-2">
              <View className="flex-row items-center justify-between gap-2">
                <Text className="text-sm font-semibold text-foreground capitalize flex-1 min-w-0">
                  {item.category}
                </Text>
                <Text
                  className="text-xs font-bold shrink-0"
                  style={{ color }}
                >
                  {fmt(item.spent)} / {fmt(item.budget)}
                </Text>
              </View>
              <View
                className="h-2.5 w-full rounded-full overflow-hidden"
                style={{ backgroundColor: trackColor }}
              >
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    backgroundColor: color,
                  }}
                />
              </View>
              <Text className="text-[11px] text-muted text-right font-medium">
                {pct.toFixed(0)}% used
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

export const BudgetVsActual = memo(BudgetVsActualInner);
