import { View, Text, Pressable } from "react-native";
import { Card, Chip, useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { BudgetProgressBar } from "./BudgetProgressBar";
import type { Budget } from "@/types/budget";
import { useCurrency } from "@/hooks/useCurrency";
import { formatMoney } from "@/components/reports/utils";

interface Props {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  food: "restaurant-outline",
  transport: "car-outline",
  entertainment: "film-outline",
  shopping: "bag-outline",
  health: "medkit-outline",
  bills: "receipt-outline",
  education: "book-outline",
  travel: "airplane-outline",
  housing: "home-outline",
  other: "cube-outline",
};

export function BudgetCard({ budget, onEdit, onDelete }: Props) {
  const { code: profileCurrency } = useCurrency();
  const budgetCurrency = budget.currency ?? profileCurrency;
  const [dangerColor, mutedColor, accentColor] = useThemeColor([
    "danger",
    "muted",
    "accent",
  ]);

  const overBudget = budget.spent > budget.amount;
  const raw = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
  const nearLimit = raw >= 80 && !overBudget;
  const percentInt = Math.min(Math.round(raw), 100);

  const iconName = (CATEGORY_ICONS[budget.category.toLowerCase()] ??
    "cube-outline") as any;

  return (
    <Card className="gap-0 overflow-hidden rounded-3xl border border-separator">
      <Card.Header className="flex-row items-center justify-between py-3.5 px-4 border-b border-separator/60">
        <View className="flex-row items-center gap-3">
          <View className="size-11 rounded-2xl bg-accent/12 items-center justify-center border border-accent/20">
            <Ionicons name={iconName} size={21} color={accentColor} />
          </View>
          <View>
            <Text className="text-base font-semibold text-foreground capitalize">
              {budget.category}
            </Text>
            <Text className="text-xs text-muted">
              {formatMoney(budget.amount, budgetCurrency)} / month
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-0.5 shrink-0">
          {overBudget && (
            <Chip variant="soft" color="danger" size="sm">
              Over
            </Chip>
          )}
          {nearLimit && (
            <Chip variant="soft" color="warning" size="sm">
              {percentInt}%
            </Chip>
          )}
          {!overBudget && !nearLimit && (
            <Text
              className="text-xs font-semibold mr-1"
              style={{ color: accentColor }}
            >
              {percentInt}%
            </Text>
          )}
          <Pressable
            onPress={() => onEdit(budget)}
            hitSlop={8}
            className="p-2 rounded-full active:opacity-70"
            accessibilityLabel="Edit budget"
          >
            <Ionicons name="pencil-outline" size={18} color={mutedColor} />
          </Pressable>
          <Pressable
            onPress={() => onDelete(budget)}
            hitSlop={8}
            className="p-2 rounded-full active:opacity-70"
            accessibilityLabel="Delete budget"
          >
            <Ionicons name="trash-outline" size={18} color={dangerColor} />
          </Pressable>
        </View>
      </Card.Header>

      <Card.Body className="px-4 pb-4 pt-1">
        <BudgetProgressBar
          spent={budget.spent}
          amount={budget.amount}
          currencyCode={budgetCurrency}
        />
      </Card.Body>
    </Card>
  );
}
