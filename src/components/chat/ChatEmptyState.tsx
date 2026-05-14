import { View, Text, useColorScheme } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export function ChatEmptyState() {
  const isDark = useColorScheme() === "dark";

  return (
    <View className="flex-1 items-center justify-center px-6 pb-8 pt-2">
      <LinearGradient
        colors={
          isDark
            ? ["rgba(249,115,22,0.18)", "rgba(249,115,22,0.06)"]
            : ["rgba(234,88,12,0.14)", "rgba(234,88,12,0.04)"]
        }
        style={{
          width: 76,
          height: 76,
          borderRadius: 26,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 22,
          borderWidth: 1,
          borderColor: isDark
            ? "rgba(249,115,22,0.22)"
            : "rgba(234,88,12,0.18)",
        }}
      >
        <Text className="text-3xl">✦</Text>
      </LinearGradient>

      <Text className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent mb-2">
        AiXpense
      </Text>
      <Text className="text-[26px] font-bold text-foreground text-center tracking-tight mb-3">
        What did you spend today?
      </Text>
      <Text className="text-[15px] text-muted text-center leading-relaxed mb-2 max-w-[320px]">
        Describe expenses or income in plain language.
      </Text>
      <Text className="text-[14px] text-muted text-center leading-relaxed max-w-[320px]">
        Tap a shortcut above the message box to try it instantly.
      </Text>
    </View>
  );
}
