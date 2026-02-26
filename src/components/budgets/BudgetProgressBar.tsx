import { View, Text } from "react-native";

interface Props {
  spent: number;
  amount: number;
}

export function BudgetProgressBar({ spent, amount }: Props) {
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
    <View className="gap-2">
      <View className="h-1.5 w-full rounded-full bg-default overflow-hidden">
        <View
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </View>
      <View className="flex-row justify-between items-center">
        <Text className="text-xs text-muted">
          ₹{spent.toLocaleString("en-IN")} spent
        </Text>
        {overBudget ? (
          <Text className="text-xs font-medium text-danger">
            ₹{Math.abs(remaining).toLocaleString("en-IN")} over
          </Text>
        ) : (
          <Text className="text-xs text-muted">
            ₹{remaining.toLocaleString("en-IN")} left
          </Text>
        )}
      </View>
    </View>
  );
}
