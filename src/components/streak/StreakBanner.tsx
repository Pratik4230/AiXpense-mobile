import { View, Text } from "react-native";
import type { StreakStatus } from "@/services/streak";

type Props = {
  streak: StreakStatus | undefined;
  isLoading: boolean;
};

export function StreakBanner({ streak, isLoading }: Props) {
  if (isLoading && !streak) return null;

  if (!streak) return null;

  if (streak.rewardGranted && streak.bonusPremiumUntil) {
    const until = new Date(streak.bonusPremiumUntil);
    const label = until.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return (
      <View className="mx-4 mb-2 rounded-2xl border border-primary/30 bg-primary/10 px-3 py-2">
        <Text className="text-xs font-semibold text-primary">
          Streak complete — bonus premium active until {label}
        </Text>
      </View>
    );
  }

  if (streak.rewardGranted) {
    return (
      <View className="mx-4 mb-2 rounded-2xl border border-primary/30 bg-primary/10 px-3 py-2">
        <Text className="text-xs font-semibold text-primary">
          20-day streak complete — enjoy your 3 months premium
        </Text>
      </View>
    );
  }

  const n = streak.chatsToday;
  const need = Math.max(0, 3 - n);

  return (
    <View className="mx-4 mb-2 rounded-2xl border border-separator bg-surface/90 px-3 py-2">
      <Text className="text-xs font-medium text-foreground">
        Mobile streak: day {streak.streakCount}/{streak.targetDays} —{" "}
        {streak.qualifiedToday
          ? "Today qualified (3 chats). Come back tomorrow."
          : `${n}/3 chats today${need > 0 ? ` — ${need} more for today` : ""}`}
      </Text>
    </View>
  );
}
