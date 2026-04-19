import { View, Text, Pressable, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface SelectedTransaction {
  id: string;
  type: "expense" | "income";
  item: string;
  amount: number;
  action: "edit" | "delete";
}

interface Props {
  transaction: SelectedTransaction;
  onRemove: () => void;
}

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export function TransactionAttachment({ transaction, onRemove }: Props) {
  const isDark = useColorScheme() === "dark";
  const isDelete = transaction.action === "delete";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginHorizontal: 12,
        marginBottom: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: isDelete
          ? "rgba(239,68,68,0.28)"
          : "rgba(59,130,246,0.28)",
        backgroundColor: isDelete
          ? isDark
            ? "rgba(239,68,68,0.1)"
            : "rgba(239,68,68,0.06)"
          : isDark
            ? "rgba(59,130,246,0.1)"
            : "rgba(59,130,246,0.06)",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
        <Ionicons
          name={isDelete ? "trash-outline" : "pencil-outline"}
          size={14}
          color={isDelete ? "#ef4444" : "#3b82f6"}
        />
        <Text
          numberOfLines={1}
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: isDark ? "#e4e4e7" : "#27272a",
            flex: 1,
          }}
        >
          {isDelete ? "Delete" : "Edit"}: {transaction.item} ({fmt(transaction.amount)})
        </Text>
      </View>
      <Pressable
        onPress={onRemove}
        hitSlop={8}
        style={({ pressed }) => ({
          opacity: pressed ? 0.5 : 1,
          padding: 4,
        })}
      >
        <Ionicons
          name="close"
          size={16}
          color={isDark ? "#71717a" : "#a1a1aa"}
        />
      </Pressable>
    </View>
  );
}
