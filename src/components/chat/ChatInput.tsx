import { Platform, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button, Input } from "heroui-native";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export function ChatInput({ value, onChange, onSend, isLoading }: Props) {
  const isDark = useColorScheme() === "dark";
  const { bottom } = useSafeAreaInsets();
  const hasText = value.trim().length > 0;

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
        placeholder="Message..."
        multiline
        maxLength={500}
        submitBehavior="newline"
        isDisabled={isLoading}
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
        isDisabled={isLoading || !hasText}
        className="rounded-full w-10 h-10 self-end mb-0.5"
      >
        <Ionicons
          name={hasText ? "send" : "mic"}
          size={18}
          color="#fff"
          style={hasText ? { marginLeft: 2 } : undefined}
        />
      </Button>
    </View>
  );
}
