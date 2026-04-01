import { useState } from "react";
import { ScrollView, RefreshControl, View } from "react-native";
import { useRouter } from "expo-router";
import { Tabs, Chip } from "heroui-native";
import { SafeAreaView } from "@/components/ui";
import { useQueryClient } from "@tanstack/react-query";
import {
  useReportOverview,
  useReportTrend,
  useReportCategories,
  useReportBudgetVsActual,
  useReportTopExpenses,
  type ReportRange,
  type ReportMode,
} from "@/services/reports";
import {
  OverviewCards,
  TrendChart,
  CategoryBreakdown,
  TopExpenses,
  BudgetVsActual,
} from "@/components/reports";

const RANGES: { label: string; value: ReportRange }[] = [
  { label: "1M", value: "1m" },
  { label: "3M", value: "3m" },
  { label: "6M", value: "6m" },
  { label: "1Y", value: "1y" },
];

export default function ReportsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [range, setRange] = useState<ReportRange>("1m");
  const [mode, setMode] = useState<ReportMode>("expense");

  const overview = useReportOverview(range, mode);
  const trend = useReportTrend(range, mode);
  const categories = useReportCategories(range, mode);
  const budgetVsActual = useReportBudgetVsActual(range);
  const topExpenses = useReportTopExpenses(range, mode);

  const isRefreshing =
    overview.isRefetching ||
    trend.isRefetching ||
    categories.isRefetching ||
    topExpenses.isRefetching;

  const onRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["reports"] });
  };

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
        <View className="flex-row items-center justify-between mt-4 mb-2">
          <View>
            <Tabs
              value={mode}
              onValueChange={(v) => setMode(v as ReportMode)}
              variant="secondary"
            >
              <Tabs.List>
                <Tabs.Indicator />
                <Tabs.Trigger value="expense">
                  <Tabs.Label>Expenses</Tabs.Label>
                </Tabs.Trigger>
                <Tabs.Trigger value="income">
                  <Tabs.Label>Income</Tabs.Label>
                </Tabs.Trigger>
              </Tabs.List>
            </Tabs>
          </View>
        </View>

        <View className="flex-row gap-2 mb-4">
          {RANGES.map((r) => (
            <Chip
              key={r.value}
              size="sm"
              variant={range === r.value ? "primary" : "secondary"}
              color={range === r.value ? "accent" : "default"}
              onPress={() => setRange(r.value)}
            >
              <Chip.Label>{r.label}</Chip.Label>
            </Chip>
          ))}
        </View>

        <View className="gap-4">
          <OverviewCards
            data={overview.data}
            isLoading={overview.isLoading}
            mode={mode}
          />

          <TrendChart
            data={trend.data}
            isLoading={trend.isLoading}
            range={range}
            mode={mode}
          />

          <CategoryBreakdown
            data={categories.data}
            isLoading={categories.isLoading}
          />

          <TopExpenses
            data={topExpenses.data}
            isLoading={topExpenses.isLoading}
            mode={mode}
            onViewAll={() => router.push(`/transactions?mode=${mode}`)}
          />

          {mode === "expense" && (
            <BudgetVsActual
              data={budgetVsActual.data}
              isLoading={budgetVsActual.isLoading}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
