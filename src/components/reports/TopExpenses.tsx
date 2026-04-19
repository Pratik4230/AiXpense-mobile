import { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { Card, Chip, Skeleton, useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { fmt } from "./utils";
import type { TopExpense, ReportMode } from "@/services/reports";

interface Props {
  data?: TopExpense[];
  isLoading: boolean;
  mode: ReportMode;
  onViewAll?: () => void;
}

function TopExpensesInner({ data, isLoading, mode, onViewAll }: Props) {
  const [accentColor, mutedColor] = useThemeColor(["accent", "muted"]);

  return (
    <Card className="p-4 rounded-3xl border border-separator overflow-hidden">
      <View className="flex-row items-center justify-between mb-1">
        <View>
          <Card.Title className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            {mode === "expense" ? "Top expenses" : "Top income"}
          </Card.Title>
          <Card.Description className="text-xs text-muted mt-0.5">
            Largest entries this period
          </Card.Description>
        </View>
        <Pressable
          onPress={onViewAll}
          hitSlop={10}
          className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-xl active:opacity-70"
          accessibilityLabel="View all transactions"
          accessibilityRole="button"
        >
          <Text className="text-xs font-semibold" style={{ color: accentColor }}>
            View all
          </Text>
          <Ionicons name="chevron-forward" size={14} color={accentColor} />
        </Pressable>
      </View>
      {isLoading ? (
        <View className="gap-2.5 mt-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[52px] w-full rounded-2xl" />
          ))}
        </View>
      ) : !data || data.length === 0 ? (
        <View className="py-10 items-center rounded-2xl border border-dashed border-separator bg-surface/40 mt-4">
          <Ionicons name="receipt-outline" size={28} color={mutedColor} />
          <Card.Description className="text-sm text-muted text-center mt-2 px-4">
            No {mode === "expense" ? "expenses" : "income"} in this range
          </Card.Description>
        </View>
      ) : (
        <View className="gap-2 mt-4">
          {data.map((e, i) => (
            <View
              key={e._id}
              className="flex-row items-center justify-between py-3 px-3 rounded-2xl bg-default/80 border border-separator/60"
            >
              <View className="flex-row items-center gap-3 flex-1 mr-2 min-w-0">
                <View className="w-7 h-7 rounded-full bg-accent/15 items-center justify-center shrink-0">
                  <Text className="text-xs font-bold text-accent">{i + 1}</Text>
                </View>
                <View className="flex-1 min-w-0">
                  <Text
                    className="text-sm font-semibold text-foreground"
                    numberOfLines={1}
                  >
                    {e.item}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-1 flex-wrap">
                    <Chip size="sm" variant="soft" color="default">
                      <Chip.Label className="text-[11px] capitalize">
                        {e.category}
                      </Chip.Label>
                    </Chip>
                    <Text className="text-[11px] text-muted">
                      {new Date(e.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Text>
                  </View>
                </View>
              </View>
              <Text className="text-sm font-bold text-foreground shrink-0">
                {fmt(e.amount)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

export const TopExpenses = memo(TopExpensesInner);
