import { View, Text } from "react-native";
import { formatMoney } from "@/components/reports/utils";

interface Props {
  spent: number;
  amount: number;
  currencyCode: string;
}

export function BudgetProgressBar({ spent, amount, currencyCode }: Props) {
  const raw = amount > 0 ? (spent / amount) * 100 : 0;
  const percent = Math.min(raw, 100);
  const overBudget = spent > amount;
  const nearLimit = raw >= 80 && !overBudget;
  const remaining = amount - spent;

  const barColor = overBudget
    ? "bg-danger"
    : nearLimit
      ? "bg-warning"
      : "bg-accent";

  return (
    <View className="gap-2.5">
      <View className="h-2 w-full rounded-full bg-default overflow-hidden">
        <View
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </View>
      <View className="flex-row justify-between items-center">
        <Text className="text-xs text-muted">
          {formatMoney(spent, currencyCode)} spent
        </Text>
        {overBudget ? (
          <Text className="text-xs font-medium text-danger">
            {formatMoney(Math.abs(remaining), currencyCode)} over
          </Text>
        ) : (
          <Text className="text-xs text-muted">
            {formatMoney(remaining, currencyCode)} left
          </Text>
        )}
      </View>
    </View>
  );
}
