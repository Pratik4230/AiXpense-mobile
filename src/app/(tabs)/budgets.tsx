import { useRef } from "react";
import { View, FlatList, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, useThemeColor } from "heroui-native";
import { SafeAreaView } from "@/components/ui";
import { BudgetCard } from "@/components/budgets/BudgetCard";
import { BudgetSheet } from "@/components/budgets/BudgetSheet";
import type { BudgetSheetRef } from "@/components/budgets/BudgetSheet";
import { useBudgets } from "@/services/budgets";

function BudgetSkeleton() {
  return (
    <View className="gap-3">
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          className="h-24 rounded-2xl bg-surface"
          style={{ opacity: 1 - i * 0.25 }}
        />
      ))}
    </View>
  );
}

export default function BudgetsScreen() {
  const addSheetRef = useRef<BudgetSheetRef>(null);
  const { data: budgets, isLoading } = useBudgets();
  const [accentColor] = useThemeColor(["accent"]);

  const existingCategories = budgets?.map((b) => b.category) ?? [];
  const totalBudget = budgets?.reduce((s, b) => s + b.amount, 0) ?? 0;
  const totalSpent = budgets?.reduce((s, b) => s + b.spent, 0) ?? 0;
  const overAll = totalSpent > totalBudget;
  const overallPercent =
    totalBudget > 0
      ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100)
      : 0;
  const budgetsOverLimit =
    budgets?.filter((b) => b.spent > b.amount).length ?? 0;

  const hasBudgets = !isLoading && budgets && budgets.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4">
        <View className="flex-row items-center justify-between py-4">
          <View>
            <Text className="text-2xl font-bold text-foreground">Budgets</Text>
            <Text className="text-sm text-muted">Monthly spending limits</Text>
          </View>
          <Button onPress={() => addSheetRef.current?.open()} size="sm">
            <Ionicons name="add" size={16} color="white" />
            <Button.Label>Add</Button.Label>
          </Button>
        </View>

        {hasBudgets && (
          <Card className="mb-4">
            <Card.Body className="flex-row gap-4 items-center">
              <View className="flex-1 gap-3.5">
                <View className="flex-row justify-between">
                  <View>
                    <Text className="text-xs text-muted mb-0.5">
                      Total spent
                    </Text>
                    <Text
                      className={`text-xl font-bold ${overAll ? "text-danger" : "text-foreground"}`}
                    >
                      ₹{totalSpent.toLocaleString("en-IN")}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xs text-muted mb-0.5">
                      Total limit
                    </Text>
                    <Text className="text-xl font-bold text-foreground">
                      ₹{totalBudget.toLocaleString("en-IN")}
                    </Text>
                  </View>
                </View>

                <View className="h-2 w-full rounded-full bg-default overflow-hidden">
                  <View
                    className={`h-full rounded-full ${overAll ? "bg-danger" : overallPercent >= 80 ? "bg-warning" : "bg-accent"}`}
                    style={{ width: `${overallPercent}%` }}
                  />
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-xs text-muted">
                    {overallPercent}% of budget used
                  </Text>
                  {budgetsOverLimit > 0 && (
                    <Text className="text-xs font-medium text-danger">
                      {budgetsOverLimit} over limit
                    </Text>
                  )}
                </View>
              </View>
            </Card.Body>
          </Card>
        )}

        {isLoading ? (
          <BudgetSkeleton />
        ) : budgets && budgets.length > 0 ? (
          <FlatList
            data={budgets}
            keyExtractor={(b) => b._id}
            renderItem={({ item }) => (
              <View className="mb-3">
                <BudgetCard
                  budget={item}
                  existingCategories={existingCategories}
                />
              </View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        ) : (
          <View className="flex-1 items-center justify-center gap-4">
            <View className="size-20 items-center justify-center rounded-3xl bg-accent-soft">
              <Ionicons name="wallet-outline" size={36} color={accentColor} />
            </View>
            <View className="items-center gap-1">
              <Text className="text-xl font-bold text-foreground">
                No budgets yet
              </Text>
              <Text className="text-sm text-muted text-center px-8">
                Set monthly limits to keep your spending on track
              </Text>
            </View>
            <Button onPress={() => addSheetRef.current?.open()}>
              <Ionicons name="add" size={16} color="white" />
              <Button.Label>Create your first budget</Button.Label>
            </Button>
          </View>
        )}
      </View>

      <BudgetSheet ref={addSheetRef} existingCategories={existingCategories} />
    </SafeAreaView>
  );
}
