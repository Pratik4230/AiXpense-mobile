import {
  BudgetVsActual,
  CategoryBreakdown,
  OverviewCards,
  TopExpenses,
  TrendChart,
} from "@/components/reports";
import { SafeAreaView } from "@/components/ui";
import {
  useReportData,
  type ReportMode,
  type ReportRange,
} from "@/services/reports";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Chip, Tabs, useThemeColor } from "heroui-native";
import { useCallback, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const RANGES: { label: string; value: ReportRange }[] = [
  { label: "1M", value: "1m" },
  { label: "3M", value: "3m" },
  { label: "6M", value: "6m" },
  { label: "1Y", value: "1y" },
];

export default function ReportsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const [accentColor] = useThemeColor(["accent"]);

  const [range, setRange] = useState<ReportRange>("1m");
  const [mode, setMode] = useState<ReportMode>("expense");

  const report = useReportData(range, mode);

  const onRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["reports"] });
  }, [queryClient]);

  const bottomPad = Math.max(insets.bottom, 20) + 8;
  const chartWidth = useMemo(
    () => Math.max(240, Math.min(screenWidth - 40, 360)),
    [screenWidth],
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: bottomPad,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={report.isRefetching}
            onRefresh={onRefresh}
            tintColor={accentColor}
            colors={[accentColor]}
          />
        }
      >
        <View className="pt-2 pb-4">
          <Text className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted mb-1">
            AiXpense
          </Text>
          <Text className="text-2xl font-bold text-foreground tracking-tight">
            Reports
          </Text>
          <Text className="text-sm text-muted mt-1 leading-snug">
            Spending and income insights for your selected period.
          </Text>
        </View>

        <View className="mb-4">
          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as ReportMode)}
            variant="secondary"
          >
            <Tabs.List className="w-full">
              <Tabs.Indicator />
              <Tabs.Trigger value="expense" className="flex-1">
                <Tabs.Label>Expenses</Tabs.Label>
              </Tabs.Trigger>
              <Tabs.Trigger value="income" className="flex-1">
                <Tabs.Label>Income</Tabs.Label>
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs>
        </View>

        <View className="flex-row flex-wrap gap-2 mb-5">
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

        <View className="gap-5">
          <OverviewCards
            data={report.data?.overview}
            isLoading={report.isPending}
            mode={mode}
          />

          <TrendChart
            data={report.data?.trend}
            isLoading={report.isPending}
            range={range}
            mode={mode}
            chartWidth={chartWidth}
          />

          <CategoryBreakdown
            data={report.data?.categories}
            isLoading={report.isPending}
          />

          <TopExpenses
            data={report.data?.topExpenses}
            isLoading={report.isPending}
            mode={mode}
            onViewAll={() => router.push(`/transactions?mode=${mode}`)}
          />

          {mode === "expense" && (
            <BudgetVsActual
              data={report.data?.budgetVsActual ?? undefined}
              isLoading={report.isPending}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
