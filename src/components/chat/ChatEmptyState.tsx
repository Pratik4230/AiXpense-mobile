import { View, Text, useColorScheme, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

const QUICK_ACTIONS = [
  { icon: "☕", label: "Coffee ₹80" },
  { icon: "🍕", label: "Lunch ₹250" },
  { icon: "💰", label: "Salary ₹50,000" },
  { icon: "🚕", label: "Cab ₹150" },
  { icon: "🛒", label: "Groceries ₹1,200" },
  { icon: "💡", label: "Electricity ₹800" },
];

interface Props {
  onSuggestion: (s: string) => void;
}

export function ChatEmptyState({ onSuggestion }: Props) {
  const isDark = useColorScheme() === "dark";

  return (
    <View className="flex-1 items-center justify-center px-6 pb-8">
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
      <Text className="text-[15px] text-muted text-center leading-relaxed mb-9 max-w-[320px]">
        Describe expenses or income in plain language. Tap a shortcut below to
        try it instantly.
      </Text>

      <View className="flex-row flex-wrap gap-2 justify-center max-w-[360px]">
        {QUICK_ACTIONS.map((a) => (
          <Pressable
            key={a.label}
            onPress={() => {
              void Haptics.selectionAsync();
              onSuggestion(a.label);
            }}
            className="flex-row items-center gap-2 rounded-2xl border border-separator bg-surface px-3.5 py-2.5 active:opacity-80"
          >
            <Text className="text-base">{a.icon}</Text>
            <Text className="text-[13px] font-medium text-foreground">
              {a.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
