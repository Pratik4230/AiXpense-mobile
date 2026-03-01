import { View, Text, useColorScheme, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
      }}
    >
      <LinearGradient
        colors={
          isDark
            ? ["rgba(249,115,22,0.15)", "rgba(249,115,22,0.05)"]
            : ["rgba(234,88,12,0.1)", "rgba(234,88,12,0.03)"]
        }
        style={{
          width: 72,
          height: 72,
          borderRadius: 24,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
          borderWidth: 1,
          borderColor: isDark ? "rgba(249,115,22,0.2)" : "rgba(234,88,12,0.15)",
        }}
      >
        <Text style={{ fontSize: 32 }}>✦</Text>
      </LinearGradient>

      <Text
        style={{
          fontSize: 22,
          fontWeight: "800",
          color: isDark ? "#fafafa" : "#111827",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        AiXpense Assistant
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: isDark ? "#71717a" : "#9ca3af",
          textAlign: "center",
          lineHeight: 22,
          marginBottom: 32,
        }}
      >
        Track expenses & income by just typing naturally. I&apos;ll handle the
        rest.
      </Text>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          justifyContent: "center",
        }}
      >
        {QUICK_ACTIONS.map((a) => (
          <Pressable
            key={a.label}
            onPress={() => onSuggestion(a.label)}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
              backgroundColor: pressed
                ? isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)"
                : isDark
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(0,0,0,0.03)",
            })}
          >
            <Text style={{ fontSize: 14 }}>{a.icon}</Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "500",
                color: isDark ? "#a1a1aa" : "#6b7280",
              }}
            >
              {a.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
