import { api } from "@/lib/api";

export type StreakStatus = {
  todayKey: string;
  chatsToday: number;
  qualifiedToday: boolean;
  streakCount: number;
  targetDays: number;
  rewardGranted: boolean;
  bonusPremiumUntil: string | null;
};

export function fetchStreakStatus(): Promise<StreakStatus> {
  return api.get<StreakStatus>("/api/streak-status").then((r) => r.data);
}
