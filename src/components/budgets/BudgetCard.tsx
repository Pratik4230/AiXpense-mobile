import { useRef } from "react";
import { View, Text, Alert } from "react-native";
import { Button, Card, Chip, useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { BudgetProgressBar } from "./BudgetProgressBar";
import { BudgetSheet } from "./BudgetSheet";
import type { BudgetSheetRef } from "./BudgetSheet";
import { useDeleteBudget } from "@/services/budgets";
import type { Budget } from "@/types/budget";

interface Props {
  budget: Budget;
  existingCategories: string[];
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

export function BudgetCard({ budget, existingCategories }: Props) {
  const editSheetRef = useRef<BudgetSheetRef>(null);
  const deleteMutation = useDeleteBudget();
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

  const handleDelete = () => {
    Alert.alert(
      "Delete budget?",
      `Remove monthly budget for ${budget.category}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(budget._id),
        },
      ],
    );
  };

  return (
    <>
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
                {"\u20B9"}
                {budget.amount.toLocaleString("en-IN")} / month
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-1">
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
            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              onPress={() => editSheetRef.current?.open()}
            >
              <Ionicons name="pencil-outline" size={15} color={mutedColor} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              onPress={handleDelete}
              isDisabled={deleteMutation.isPending}
            >
              <Ionicons name="trash-outline" size={15} color={dangerColor} />
            </Button>
          </View>
        </Card.Header>

        <Card.Body className="px-4 pb-4 pt-1">
          <BudgetProgressBar spent={budget.spent} amount={budget.amount} />
        </Card.Body>
      </Card>

      <BudgetSheet
        ref={editSheetRef}
        existing={budget}
        existingCategories={existingCategories}
      />
    </>
  );
}
