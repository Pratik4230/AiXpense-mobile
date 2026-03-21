import { Platform, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button, Input } from "heroui-native";
import type { SelectedTransaction } from "./TransactionAttachment";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  isLoading: boolean;
  selectedTransaction?: SelectedTransaction | null;
}

export function ChatInput({ value, onChange, onSend, isLoading, selectedTransaction }: Props) {
  const isDark = useColorScheme() === "dark";
  const { bottom } = useSafeAreaInsets();
  const hasText = value.trim().length > 0;
  const isDelete = selectedTransaction?.action === "delete";
  const canSend = isDelete || hasText;

  const placeholder = selectedTransaction
    ? selectedTransaction.action === "delete"
      ? "Tap send to confirm delete..."
      : "Type what to change..."
    : "Message...";

  return (
    <View
      style={{
        backgroundColor: isDark ? "#09090b" : "#f0f2f5",
        paddingHorizontal: 8,
        paddingTop: 8,
        paddingBottom: Math.max(bottom, 8),
        borderTopWidth: 1,
        borderTopColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 8,
      }}
    >
      <Input
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        multiline
        maxLength={500}
        submitBehavior="newline"
        isDisabled={isLoading || isDelete}
        className="flex-1 rounded-full px-4"
        style={{
          maxHeight: 120,
          paddingVertical: Platform.OS === "android" ? 10 : 10,
          fontSize: 15,
          lineHeight: 20,
          includeFontPadding: false,
          textAlignVertical: "center",
        }}
      />

      <Button
        isIconOnly
        size="sm"
        onPress={onSend}
        isDisabled={isLoading || !canSend}
        className={`rounded-full w-10 h-10 self-end mb-0.5 ${isDelete ? "bg-danger" : ""}`}
      >
        <Ionicons
          name={isDelete ? "trash" : canSend ? "send" : "mic"}
          size={18}
          color="#fff"
          style={canSend && !isDelete ? { marginLeft: 2 } : undefined}
        />
      </Button>
    </View>
  );
}
