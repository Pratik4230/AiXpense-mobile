import { View, Text, Pressable, useColorScheme } from "react-native";
import { Card, Chip, Skeleton } from "heroui-native";
import { fmt } from "./utils";
import type { TopExpense, ReportMode } from "@/services/reports";

interface Props {
  data?: TopExpense[];
  isLoading: boolean;
  mode: ReportMode;
  onViewAll?: () => void;
}

export function TopExpenses({ data, isLoading, mode, onViewAll }: Props) {
  const isDark = useColorScheme() === "dark";

  return (
    <Card className="p-4">
      <View className="flex-row items-center justify-between mb-3">
        <Card.Title className="text-sm font-semibold">
          {mode === "expense" ? "Top Expenses" : "Top Income"}
        </Card.Title>
        <Pressable onPress={onViewAll} hitSlop={8}>
          <Text
            className="text-xs"
            style={{ color: isDark ? "#f97316" : "#ea580c" }}
          >
            View All
          </Text>
        </Pressable>
      </View>
      {isLoading ? (
        <View className="gap-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </View>
      ) : !data || data.length === 0 ? (
        <View className="py-8 items-center">
          <Card.Description>
            No {mode === "expense" ? "expenses" : "income"} this period
          </Card.Description>
        </View>
      ) : (
        <View className="gap-1">
          {data.map((e, i) => (
            <View
              key={e._id}
              className="flex-row items-center justify-between py-2.5 border-b border-border/40"
              style={i === data.length - 1 ? { borderBottomWidth: 0 } : {}}
            >
              <View className="flex-row items-center gap-3 flex-1 mr-2">
                <Text
                  className="text-xs w-4"
                  style={{ color: isDark ? "#71717a" : "#a1a1aa" }}
                >
                  {i + 1}
                </Text>
                <View className="flex-1">
                  <Text
                    className="text-sm font-medium"
                    numberOfLines={1}
                    style={{ color: isDark ? "#fafafa" : "#18181b" }}
                  >
                    {e.item}
                  </Text>
                  <View className="flex-row items-center gap-1.5 mt-1">
                    <Chip size="sm" variant="secondary" color="default">
                      <Chip.Label className="text-xs capitalize">
                        {e.category}
                      </Chip.Label>
                    </Chip>
                    <Text
                      className="text-xs"
                      style={{ color: isDark ? "#71717a" : "#a1a1aa" }}
                    >
                      {new Date(e.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Text>
                  </View>
                </View>
              </View>
              <Text
                className="text-sm font-semibold"
                style={{ color: isDark ? "#fafafa" : "#18181b" }}
              >
                {fmt(e.amount)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}
