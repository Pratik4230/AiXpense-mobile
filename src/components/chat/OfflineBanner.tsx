import { View, Text, Pressable, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  pendingCount: number;
  isOnline: boolean;
  syncing?: boolean;
  onRetryAll?: () => void;
};

export function OfflineBanner({
  pendingCount,
  isOnline,
  syncing,
  onRetryAll,
}: Props) {
  const isDark = useColorScheme() === "dark";

  if (isOnline && pendingCount === 0 && !syncing) return null;

  const bg = !isOnline
    ? isDark
      ? "rgba(245, 158, 11, 0.15)"
      : "rgba(245, 158, 11, 0.12)"
    : isDark
      ? "rgba(59, 130, 246, 0.15)"
      : "rgba(59, 130, 246, 0.1)";

  const border = !isOnline
    ? "rgba(245, 158, 11, 0.35)"
    : "rgba(59, 130, 246, 0.3)";

  const color = !isOnline ? "#d97706" : "#2563eb";

  const label = !isOnline
    ? pendingCount > 0
      ? `Offline · ${pendingCount} waiting to sync`
      : "You're offline"
    : syncing
      ? "Syncing queued messages…"
      : `${pendingCount} queued · waiting to send`;

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: border,
        backgroundColor: bg,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Ionicons
        name={isOnline ? "cloud-upload-outline" : "cloud-offline-outline"}
        size={18}
        color={color}
      />
      <Text
        style={{
          flex: 1,
          fontSize: 13,
          fontWeight: "600",
          color: isDark ? "#e4e4e7" : "#3f3f46",
        }}
      >
        {label}
      </Text>
      {isOnline && pendingCount > 0 && onRetryAll ? (
        <Pressable onPress={onRetryAll} hitSlop={8}>
          <Text style={{ fontSize: 13, fontWeight: "700", color }}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
