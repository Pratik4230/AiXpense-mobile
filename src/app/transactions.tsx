import { useState, useCallback, useMemo, memo } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Skeleton } from "heroui-native";
import { SafeAreaView } from "@/components/ui";
import {
  useTransactions,
  type Transaction,
  type TransactionFilters,
} from "@/services/transactions";
import { TransactionFiltersSheet } from "@/components/transactions/TransactionFiltersSheet";

const ROW_HEIGHT = 64;

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

interface RowProps {
  tx: Transaction;
  isDark: boolean;
}

const TransactionRow = memo(function TransactionRow({ tx, isDark }: RowProps) {
  const isExpense = tx.type === "expense";
  return (
    <View
      className="flex-row items-center px-4 border-b border-border/30"
      style={{ height: ROW_HEIGHT }}
    >
      <View
        className="w-9 h-9 rounded-full items-center justify-center mr-3"
        style={{
          backgroundColor: isExpense
            ? "rgba(239,68,68,0.1)"
            : "rgba(16,185,129,0.1)",
        }}
      >
        <Ionicons
          name={isExpense ? "arrow-up" : "arrow-down"}
          size={16}
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
        <View className="flex-row items-center gap-1.5 mt-0.5">
          <Text
            className="text-xs capitalize"
            style={{ color: isDark ? "#71717a" : "#a1a1aa" }}
          >
            {tx.category}
          </Text>
          <Text
            className="text-xs"
            style={{ color: isDark ? "#52525b" : "#d4d4d8" }}
          >
            ·
          </Text>
          <Text
            className="text-xs"
            style={{ color: isDark ? "#71717a" : "#a1a1aa" }}
          >
            {formatDate(tx.date)}
          </Text>
        </View>
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

const getItemLayout = (_: unknown, index: number) => ({
  length: ROW_HEIGHT,
  offset: ROW_HEIGHT * index,
  index,
});

const keyExtractor = (item: Transaction) => item._id;

export default function TransactionsScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isDark = useColorScheme() === "dark";

  const initialType =
    mode === "income" ? "income" : mode === "expense" ? "expense" : "all";

  const [filters, setFilters] = useState<TransactionFilters>({
    type: initialType,
    categories: [],
    sort: "date",
    order: "desc",
  });

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useTransactions(filters);

  const rows = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);
  const total = data?.pages[0]?.total ?? 0;

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: Transaction }) => (
      <TransactionRow tx={item} isDark={isDark} />
    ),
    [isDark],
  );

  const ListFooter = useMemo(
    () =>
      isFetchingNextPage ? (
        <View className="py-4 items-center">
          <ActivityIndicator
            size="small"
            color={isDark ? "#f97316" : "#ea580c"}
          />
        </View>
      ) : null,
    [isFetchingNextPage, isDark],
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-3 border-b border-border/30">
        <Pressable onPress={() => router.back()} hitSlop={12} className="mr-3">
          <Ionicons
            name="arrow-back"
            size={22}
            color={isDark ? "#fafafa" : "#18181b"}
          />
        </Pressable>
        <View className="flex-1">
          <Text
            className="text-lg font-bold"
            style={{ color: isDark ? "#fafafa" : "#18181b" }}
          >
            Transactions
          </Text>
          {!isLoading && (
            <Text
              className="text-xs"
              style={{ color: isDark ? "#71717a" : "#a1a1aa" }}
            >
              {total} transactions
            </Text>
          )}
        </View>
        <TransactionFiltersSheet
          filters={filters}
          onApply={setFilters}
          total={total}
        />
      </View>

      {isLoading ? (
        <View className="px-4 gap-3 mt-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </View>
      ) : rows.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Ionicons
            name="receipt-outline"
            size={48}
            color={isDark ? "#3f3f46" : "#d4d4d8"}
          />
          <Text
            className="text-sm mt-3"
            style={{ color: isDark ? "#71717a" : "#a1a1aa" }}
          >
            No transactions found
          </Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          onRefresh={refetch}
          refreshing={isRefetching}
          showsVerticalScrollIndicator={false}
          maxToRenderPerBatch={15}
          windowSize={7}
          removeClippedSubviews
          ListFooterComponent={ListFooter}
        />
      )}
    </SafeAreaView>
  );
}
