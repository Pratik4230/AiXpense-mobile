import { View, Text, Pressable, Alert } from "react-native";
import { Card, Chip, useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import type { RecurringPayment } from "@/services/recurring";
import { useCurrency } from "@/hooks/useCurrency";

const FREQ_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

function formatDueDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface Props {
  rule: RecurringPayment;
  onEdit: (rule: RecurringPayment) => void;
  onToggle: (rule: RecurringPayment) => void;
  onDelete: (rule: RecurringPayment) => void;
}

export function RecurringCard({ rule, onEdit, onToggle, onDelete }: Props) {
  const { format } = useCurrency();
  const [mutedColor, accentColor, dangerColor] = useThemeColor([
    "muted",
    "accent",
    "danger",
  ]);

  const nextDue = formatDueDate(rule.nextDueDate);
  const isOverdue =
    new Date(rule.nextDueDate) < new Date() && rule.isActive;
  const isExpense = rule.type === "expense";

  const handleDelete = () => {
    Alert.alert(
      "Delete recurring payment?",
      "Past transactions already created will not be affected.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(rule),
        },
      ],
    );
  };

  return (
    <Card
      className={`rounded-3xl border border-separator overflow-hidden ${!rule.isActive ? "opacity-60" : ""}`}
    >
      <Card.Body className="gap-3 py-4">
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1 min-w-0">
            <View className="flex-row items-center gap-2 flex-wrap">
              <Text
                className="text-base font-semibold text-foreground"
                numberOfLines={1}
              >
                {rule.name}
              </Text>
              {!rule.isActive && (
                <Chip size="sm" variant="secondary">
                  <Chip.Label>Paused</Chip.Label>
                </Chip>
              )}
            </View>
            <Chip size="sm" variant="secondary" className="mt-2 self-start">
              <Chip.Label className="capitalize">{rule.category}</Chip.Label>
            </Chip>
          </View>

          <View className="flex-row items-center gap-0.5 shrink-0">
            <Pressable
              onPress={() => onEdit(rule)}
              hitSlop={8}
              className="p-2 rounded-full active:opacity-70"
              accessibilityLabel="Edit"
            >
              <Ionicons name="pencil-outline" size={18} color={mutedColor} />
            </Pressable>
            <Pressable
              onPress={() => onToggle(rule)}
              hitSlop={8}
              className="p-2 rounded-full active:opacity-70"
              accessibilityLabel={rule.isActive ? "Pause" : "Resume"}
            >
              <Ionicons
                name={rule.isActive ? "pause-outline" : "play-outline"}
                size={18}
                color={mutedColor}
              />
            </Pressable>
            <Pressable
              onPress={handleDelete}
              hitSlop={8}
              className="p-2 rounded-full active:opacity-70"
              accessibilityLabel="Delete"
            >
              <Ionicons name="trash-outline" size={18} color={dangerColor} />
            </Pressable>
          </View>
        </View>

        <Text
          className="text-lg font-semibold"
          style={{ color: isExpense ? dangerColor : accentColor }}
        >
          {isExpense ? "-" : "+"}
          {format(rule.amount, rule.currency)}
        </Text>

        <View className="flex-row flex-wrap gap-x-4 gap-y-1">
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="repeat-outline" size={14} color={mutedColor} />
            <Text className="text-sm text-muted">
              {FREQ_LABELS[rule.frequency] ?? rule.frequency}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Ionicons
              name="calendar-outline"
              size={14}
              color={isOverdue ? dangerColor : mutedColor}
            />
            <Text
              className="text-sm"
              style={{ color: isOverdue ? dangerColor : undefined }}
            >
              Next: {nextDue}
              {isOverdue ? " (overdue)" : ""}
            </Text>
          </View>
        </View>

        {rule.notes ? (
          <Text className="text-xs text-muted" numberOfLines={2}>
            {rule.notes}
          </Text>
        ) : null}
      </Card.Body>
    </Card>
  );
}
