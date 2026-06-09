import { useState } from "react";
import { View, Text, FlatList, RefreshControl, Alert, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, useThemeColor } from "heroui-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SafeAreaView } from "@/components/ui";
import { BudgetCard } from "@/components/budgets/BudgetCard";
import { BudgetsSheet, type BudgetSheetMode } from "@/components/budgets/BudgetsSheet";
import {
  useBudgets,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
} from "@/services/budgets";
import type { Budget } from "@/types/budget";
import type { Category } from "@/constants/expense";
import { useCurrency } from "@/hooks/useCurrency";

function BudgetSkeleton() {
  return (
    <View className="gap-3 px-4 pt-1">
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          className="h-[88px] rounded-3xl border border-separator bg-surface"
          style={{ opacity: 1 - (i - 1) * 0.12 }}
        />
      ))}
    </View>
  );
}

export default function BudgetsScreen() {
  const [sheetMode, setSheetMode] = useState<BudgetSheetMode>(null);

  const { data: budgets, isLoading, isRefetching, refetch } = useBudgets();
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const deleteMutation = useDeleteBudget();
  const isFormPending = createMutation.isPending || updateMutation.isPending;

  const [accentColor] = useThemeColor(["accent"]);
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 20) + 8;
  const { code: accountCurrencyCode, format } = useCurrency();
  const editBudget =
    sheetMode?.type === "edit" ? sheetMode.budget : undefined;
  const limitCurrencyCode =
    editBudget?.currency ?? accountCurrencyCode;

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

  const closeSheet = () => setSheetMode(null);

  const handleCreate = (data: { category: Category; amount: number }) => {
    createMutation.mutate(data, {
      onSuccess: closeSheet,
      onError: () => Alert.alert("Error", "Failed to create budget."),
    });
  };

  const handleUpdate = (data: { id: string; amount: number }) => {
    updateMutation.mutate(data, {
      onSuccess: closeSheet,
      onError: () => Alert.alert("Error", "Failed to update budget."),
    });
  };

  const handleDeleteConfirm = (budget: Budget) => {
    deleteMutation.mutate(budget._id, {
      onSuccess: closeSheet,
      onError: () => Alert.alert("Error", "Failed to delete budget."),
    });
  };

  const ListHeader = (
    <View className="px-4">
      <View className="flex-row items-end justify-between pb-4 pt-1">
        <View className="flex-1 pr-3">
          <Text className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted mb-1">
            AiXpense
          </Text>
          <Text className="text-2xl font-bold text-foreground tracking-tight">
            Budgets
          </Text>
          <Text className="text-sm text-muted mt-1 leading-snug">
            Monthly limits by category to stay ahead of your spending.
          </Text>
        </View>
        <Pressable
          onPress={() => setSheetMode({ type: "add" })}
          className="shrink-0 flex-row items-center gap-1.5 h-9 px-3.5 rounded-3xl bg-accent active:opacity-90"
          accessibilityLabel="Add budget"
        >
          <Ionicons name="add" size={17} color="white" />
          <Text className="text-sm font-medium text-accent-foreground">Add</Text>
        </Pressable>
      </View>

      {hasBudgets && (
        <Card className="mb-5 rounded-3xl border border-separator overflow-hidden">
          <Card.Body className="gap-4 py-4 px-1">
            <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted px-3">
              Overview
            </Text>
            <View className="flex-row justify-between px-3">
              <View>
                <Text className="text-xs text-muted mb-1">Total spent</Text>
                <Text
                  className={`text-2xl font-bold tracking-tight ${overAll ? "text-danger" : "text-foreground"}`}
                >
                  {format(totalSpent)}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xs text-muted mb-1">Total limit</Text>
                <Text className="text-2xl font-bold text-foreground tracking-tight">
                  {format(totalBudget)}
                </Text>
              </View>
            </View>

            <View className="px-3">
              <View className="h-2.5 w-full rounded-full bg-default overflow-hidden">
                <View
                  className={`h-full rounded-full ${overAll ? "bg-danger" : overallPercent >= 80 ? "bg-warning" : "bg-accent"}`}
                  style={{ width: `${overallPercent}%` }}
                />
              </View>
            </View>

            <View className="flex-row justify-between items-center px-3">
              <Text className="text-xs text-muted">
                {overallPercent}% of combined budget
              </Text>
              {budgetsOverLimit > 0 ? (
                <Text className="text-xs font-semibold text-danger">
                  {budgetsOverLimit}{" "}
                  {budgetsOverLimit === 1 ? "category" : "categories"} over
                  limit
                </Text>
              ) : (
                <Text className="text-xs font-medium text-muted">
                  On track
                </Text>
              )}
            </View>
          </Card.Body>
        </Card>
      )}

      {isLoading && <BudgetSkeleton />}
    </View>
  );

  const EmptyState = !isLoading ? (
    <View className="flex-1 items-center justify-center gap-5 py-20 px-6">
      <View className="size-[76px] items-center justify-center rounded-[26px] border border-accent/25 bg-accent/10">
        <Ionicons name="wallet-outline" size={34} color={accentColor} />
      </View>
      <View className="items-center gap-2 max-w-[300px]">
        <Text className="text-xl font-bold text-foreground text-center tracking-tight">
          No budgets yet
        </Text>
        <Text className="text-[15px] text-muted text-center leading-relaxed">
          Set a monthly cap per category. We&apos;ll surface progress in chat
          and here.
        </Text>
      </View>
      <Button
        onPress={() => setSheetMode({ type: "add" })}
        className="min-w-[220px]"
      >
        <Ionicons name="add" size={17} color="white" />
        <Button.Label>Create your first budget</Button.Label>
      </Button>
    </View>
  ) : null;

  return (
    <>
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <FlatList
          data={isLoading ? [] : (budgets ?? [])}
          keyExtractor={(b) => b._id}
          renderItem={({ item }: { item: Budget }) => (
            <View className="px-4 mb-3">
              <BudgetCard
                budget={item}
                onEdit={(budget) => setSheetMode({ type: "edit", budget })}
                onDelete={(budget) =>
                  setSheetMode({ type: "delete", budget })
                }
              />
            </View>
          )}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={EmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: bottomPad,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={accentColor}
              colors={[accentColor]}
            />
          }
        />
      </SafeAreaView>

      <BudgetsSheet
        mode={sheetMode}
        onClose={closeSheet}
        existingCategories={existingCategories}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDeleteConfirm={handleDeleteConfirm}
        isFormPending={isFormPending}
        isDeletePending={deleteMutation.isPending}
        formatAmount={format}
        limitCurrencyCode={limitCurrencyCode}
      />
    </>
  );
}
