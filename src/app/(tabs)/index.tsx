import { useCallback, useMemo, memo } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  RefreshControl,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { Card, Skeleton } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { SafeAreaView } from "@/components/ui";
import { useSession } from "@/lib/authClient";
import { useReportOverview } from "@/services/reports";
import { useTransactions, type Transaction } from "@/services/transactions";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const RecentRow = memo(function RecentRow({
  tx,
  isDark,
}: {
  tx: Transaction;
  isDark: boolean;
}) {
  const isExpense = tx.type === "expense";
  return (
    <View className="flex-row items-center py-2.5">
      <View
        className="w-8 h-8 rounded-full items-center justify-center mr-3"
        style={{
          backgroundColor: isExpense
            ? "rgba(239,68,68,0.1)"
            : "rgba(16,185,129,0.1)",
        }}
      >
        <Ionicons
          name={isExpense ? "arrow-up" : "arrow-down"}
          size={14}
          color={isExpense ? "#ef4444" : "#10b981"}
        />
      </View>
      <View className="flex-1 mr-2">
        <Text
          className="text-sm font-medium"
          numberOfLines={1}
          style={{ color: isDark ? "#fafafa" : "#18181b" }}
        >
          {tx.item}
        </Text>
        <Text
          className="text-xs mt-0.5"
          style={{ color: isDark ? "#71717a" : "#a1a1aa" }}
        >
          {tx.category} · {formatDate(tx.date)}
        </Text>
      </View>
      <Text
        className="text-sm font-semibold"
        style={{ color: isExpense ? "#ef4444" : "#10b981" }}
      >
        {isExpense ? "-" : "+"}
        {fmt(tx.amount)}
      </Text>
    </View>
  );
});

export default function HomeScreen() {
  const isDark = useColorScheme() === "dark";
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userName = (session?.user as any)?.name ?? "there";
  const firstName = userName.split(" ")[0];

  const now = new Date();
  const monthLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

  const expense = useReportOverview("1m", "expense");
  const income = useReportOverview("1m", "income");

  const recentTx = useTransactions({
    type: "all",
    categories: [],
    sort: "date",
    order: "desc",
  });

  const recentRows = useMemo(
    () => (recentTx.data?.pages.flatMap((p) => p.data) ?? []).slice(0, 5),
    [recentTx.data],
  );

  const isRefreshing =
    expense.isRefetching || income.isRefetching || recentTx.isRefetching;

  const onRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["reports"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  }, [queryClient]);

  const totalSpent = expense.data?.total ?? 0;
  const totalEarned = income.data?.total ?? 0;
  const balance = totalEarned - totalSpent;
  const expenseChange = expense.data?.change ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View className="mt-4 mb-5">
          <Text
            className="text-2xl font-bold"
            style={{ color: isDark ? "#fafafa" : "#18181b" }}
          >
            Hi, {firstName}
          </Text>
          <Text
            className="text-sm mt-0.5"
            style={{ color: isDark ? "#71717a" : "#a1a1aa" }}
          >
            {monthLabel}
          </Text>
        </View>

        {expense.isLoading || income.isLoading ? (
          <View className="gap-3 mb-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <View className="flex-row gap-3">
              <Skeleton className="h-20 flex-1 rounded-xl" />
              <Skeleton className="h-20 flex-1 rounded-xl" />
            </View>
          </View>
        ) : (
          <View className="gap-3 mb-4">
            <Card className="p-4">
              <Card.Description className="text-xs mb-1">
                Balance
              </Card.Description>
              <Card.Title
                className="text-2xl font-bold"
                style={{
                  color:
                    balance >= 0 ? (isDark ? "#10b981" : "#059669") : "#ef4444",
                }}
              >
                {fmt(Math.abs(balance))}
              </Card.Title>
              <Text
                className="text-xs mt-1"
                style={{ color: isDark ? "#71717a" : "#a1a1aa" }}
              >
                {balance >= 0 ? "Surplus" : "Deficit"} this month
              </Text>
            </Card>

            <View className="flex-row gap-3">
              <Card className="flex-1 p-3">
                <View className="flex-row items-center gap-1.5 mb-1.5">
                  <View
                    className="w-5 h-5 rounded-full items-center justify-center"
                    style={{ backgroundColor: "rgba(239,68,68,0.1)" }}
                  >
                    <Ionicons name="arrow-up" size={10} color="#ef4444" />
                  </View>
                  <Card.Description className="text-xs">Spent</Card.Description>
                </View>
                <Text
                  className="text-lg font-bold"
                  style={{ color: isDark ? "#fafafa" : "#18181b" }}
                >
                  {fmt(totalSpent)}
                </Text>
                <View className="flex-row items-center gap-1 mt-1">
                  <Ionicons
                    name={
                      expenseChange > 0
                        ? "trending-up"
                        : expenseChange < 0
                          ? "trending-down"
                          : "remove"
                    }
                    size={10}
                    color={
                      expenseChange > 0
                        ? "#ef4444"
                        : expenseChange < 0
                          ? "#10b981"
                          : "#71717a"
                    }
                  />
                  <Text
                    className="text-xs"
                    style={{
                      color:
                        expenseChange > 0
                          ? "#ef4444"
                          : expenseChange < 0
                            ? "#10b981"
                            : "#71717a",
                    }}
                  >
                    {Math.abs(expenseChange)}%
                  </Text>
                </View>
              </Card>

              <Card className="flex-1 p-3">
                <View className="flex-row items-center gap-1.5 mb-1.5">
                  <View
                    className="w-5 h-5 rounded-full items-center justify-center"
                    style={{ backgroundColor: "rgba(16,185,129,0.1)" }}
                  >
                    <Ionicons name="arrow-down" size={10} color="#10b981" />
                  </View>
                  <Card.Description className="text-xs">
                    Earned
                  </Card.Description>
                </View>
                <Text
                  className="text-lg font-bold"
                  style={{ color: isDark ? "#fafafa" : "#18181b" }}
                >
                  {fmt(totalEarned)}
                </Text>
                <Text
                  className="text-xs mt-1"
                  style={{ color: isDark ? "#71717a" : "#a1a1aa" }}
                >
                  {income.data?.count ?? 0} transactions
                </Text>
              </Card>
            </View>
          </View>
        )}

        {expense.isLoading ? (
          <View className="flex-row gap-3 mb-4">
            <Skeleton className="h-16 flex-1 rounded-xl" />
            <Skeleton className="h-16 flex-1 rounded-xl" />
          </View>
        ) : (
          <View className="flex-row gap-3 mb-4">
            <Card className="flex-1 p-3">
              <Card.Description className="text-xs mb-1">
                Top Category
              </Card.Description>
              <Text
                className="text-sm font-semibold capitalize"
                style={{ color: isDark ? "#fafafa" : "#18181b" }}
              >
                {expense.data?.topCategory ?? "---"}
              </Text>
              <Text
                className="text-xs mt-0.5"
                style={{ color: isDark ? "#71717a" : "#a1a1aa" }}
              >
                {fmt(expense.data?.topCategoryAmount ?? 0)}
              </Text>
            </Card>
            <Card className="flex-1 p-3">
              <Card.Description className="text-xs mb-1">
                Largest Expense
              </Card.Description>
              <Text
                className="text-sm font-semibold"
                style={{ color: isDark ? "#fafafa" : "#18181b" }}
              >
                {fmt(expense.data?.largestExpense ?? 0)}
              </Text>
              <Text
                className="text-xs mt-0.5"
                style={{ color: isDark ? "#71717a" : "#a1a1aa" }}
              >
                single transaction
              </Text>
            </Card>
          </View>
        )}

        <Card className="p-4">
          <View className="flex-row items-center justify-between mb-3">
            <Card.Title className="text-sm font-semibold">
              Recent Transactions
            </Card.Title>
            <Pressable onPress={() => router.push("/transactions")} hitSlop={8}>
              <Text
                className="text-xs"
                style={{ color: isDark ? "#f97316" : "#ea580c" }}
              >
                View All
              </Text>
            </Pressable>
          </View>

          {recentTx.isLoading ? (
            <View className="gap-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </View>
          ) : recentRows.length === 0 ? (
            <View className="py-6 items-center">
              <Ionicons
                name="receipt-outline"
                size={32}
                color={isDark ? "#3f3f46" : "#d4d4d8"}
              />
              <Text
                className="text-xs mt-2"
                style={{ color: isDark ? "#71717a" : "#a1a1aa" }}
              >
                No transactions yet
              </Text>
            </View>
          ) : (
            recentRows.map((tx, i) => (
              <View
                key={tx._id}
                className={
                  i < recentRows.length - 1 ? "border-b border-border/30" : ""
                }
              >
                <RecentRow tx={tx} isDark={isDark} />
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
