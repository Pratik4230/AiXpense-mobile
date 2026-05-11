import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { nextStreakReminderIST } from "@/lib/ist";
import type { StreakStatus } from "@/services/streak";

const STREAK_NOTIFICATION_ID = "aixpense-streak-reminder";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let channelReady = false;

async function ensureAndroidChannel() {
  if (Platform.OS !== "android" || channelReady) return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
  channelReady = true;
}

/**
 * Schedules a one-off local notification at 20:00 IST when the user has an
 * active streak but has not yet qualified today (3 chats).
 */
export function useStreakReminder(streak: StreakStatus | undefined) {
  const lastScheduleKey = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      await ensureAndroidChannel();

      if (!streak || cancelled) return;

      if (
        streak.rewardGranted ||
        streak.streakCount === 0 ||
        streak.qualifiedToday
      ) {
        await Notifications.cancelScheduledNotificationAsync(
          STREAK_NOTIFICATION_ID,
        ).catch(() => {});
        lastScheduleKey.current = null;
        return;
      }

      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const req = await Notifications.requestPermissionsAsync();
        if (req.status !== "granted") return;
      }

      const remaining = Math.max(0, 3 - streak.chatsToday);
      const when = nextStreakReminderIST();
      const scheduleKey = `${streak.todayKey}-${when.getTime()}`;

      if (lastScheduleKey.current === scheduleKey) return;
      lastScheduleKey.current = scheduleKey;

      await Notifications.cancelScheduledNotificationAsync(
        STREAK_NOTIFICATION_ID,
      ).catch(() => {});

      await Notifications.scheduleNotificationAsync({
        identifier: STREAK_NOTIFICATION_ID,
        content: {
          title: "Keep your streak",
          body:
            remaining <= 0
              ? `You are on a ${streak.streakCount}-day streak. Open AiXpense before midnight (IST).`
              : `Send ${remaining} more chat${remaining === 1 ? "" : "s"} before midnight (IST) to keep your ${streak.streakCount}-day streak.`,
          android: { channelId: "default" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: when,
        },
      });
    }

    void sync();
    return () => {
      cancelled = true;
    };
  }, [
    streak?.todayKey,
    streak?.chatsToday,
    streak?.qualifiedToday,
    streak?.streakCount,
    streak?.rewardGranted,
  ]);
}
