import { Pressable, Text, View, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "heroui-native";
import { FREE_DAILY_LIMIT, trialUsage } from "@/services/trials";

interface TrialStatusProps {
  isPremium: boolean;
  freeTrials: number;
  onPress?: () => void;
}

export function TrialStatus({
  isPremium,
  freeTrials,
  onPress,
}: TrialStatusProps) {
  const isDark = useColorScheme() === "dark";
  const [accentColor] = useThemeColor(["accent"]);

  if (isPremium) {
    return (
      <View
        className="flex-row items-center gap-1 rounded-full border px-2.5 py-1"
        style={{
          borderColor: "rgba(245, 158, 11, 0.45)",
          backgroundColor: isDark
            ? "rgba(245, 158, 11, 0.12)"
            : "rgba(245, 158, 11, 0.1)",
        }}
      >
        <Ionicons name="sparkles" size={12} color="#d97706" />
        <Text className="text-xs font-semibold" style={{ color: "#d97706" }}>
          Premium
        </Text>
      </View>
    );
  }

  const { remaining, used, remainingPercent, exhausted } =
    trialUsage(freeTrials);
  const barFill = exhausted ? "#ef4444" : accentColor;

  const card = (
    <View
      className="rounded-2xl border border-separator bg-surface px-2.5 py-2"
      style={{ width: 152 }}
    >
      <View className="flex-row items-center justify-between gap-1 mb-1.5">
        <Ionicons
          name="sparkles-outline"
          size={12}
          color={exhausted ? "#ef4444" : accentColor}
        />
        <Text
          className="text-[11px] font-bold flex-1 text-right"
          style={{ color: exhausted ? "#ef4444" : accentColor }}
        >
          {remaining} of {FREE_DAILY_LIMIT} left
        </Text>
      </View>

      <View className="h-1.5 w-full rounded-full bg-default overflow-hidden mb-1.5">
        <View
          className="h-full rounded-full"
          style={{ width: `${remainingPercent}%`, backgroundColor: barFill }}
        />
      </View>

      <Text className="text-[10px] text-muted leading-tight">
        <Text className="font-semibold text-foreground">{used}</Text>
        {" used · "}
        <Text className="font-semibold text-foreground">{remaining}</Text>
        {" left"}
      </Text>

      {exhausted ? (
        <Text className="text-[10px] font-medium text-danger mt-1 leading-tight">
          Limit reached tap to upgrade
        </Text>
      ) : null}
    </View>
  );

  if (!onPress) {
    return card;
  }

  return (
    <Pressable
      onPress={onPress}
      className="active:opacity-85"
      accessibilityRole="button"
      accessibilityLabel={`${remaining} of ${FREE_DAILY_LIMIT} free messages left, ${used} used today`}
    >
      {card}
    </Pressable>
  );
}
