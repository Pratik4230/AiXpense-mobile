import { View, Text, useColorScheme } from "react-native";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const CONFIG: Record<
  string,
  {
    icon: React.ComponentProps<typeof Ionicons>["name"];
    label: string;
    color: string;
  }
> = {
  expense: { icon: "save-outline", label: "Saving expense", color: "#10b981" },
  income: { icon: "save-outline", label: "Saving income", color: "#3b82f6" },
  thinking: {
    icon: "ellipsis-horizontal",
    label: "Thinking",
    color: "#f97316",
  },
};

export function ToolLoading({ type }: { type: string }) {
  const isDark = useColorScheme() === "dark";
  const cfg = CONFIG[type] ?? CONFIG.thinking;

  const dotStyle = useAnimatedStyle(() => ({
    opacity: withRepeat(
      withSequence(
        withTiming(0.2, { duration: 500 }),
        withTiming(1, { duration: 500 }),
      ),
      -1,
      true,
    ),
  }));

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Animated.View style={dotStyle}>
        <Ionicons name={cfg.icon} size={14} color={cfg.color} />
      </Animated.View>
      <Text
        style={{
          fontSize: 13,
          color: isDark ? "#71717a" : "#9ca3af",
          fontWeight: "500",
        }}
      >
        {cfg.label}
      </Text>
      <Animated.View style={[dotStyle, { flexDirection: "row", gap: 2 }]}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={{
              width: 3,
              height: 3,
              borderRadius: 2,
              backgroundColor: isDark ? "#52525b" : "#d1d5db",
            }}
          />
        ))}
      </Animated.View>
    </View>
  );
}
