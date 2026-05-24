import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { api } from "@/lib/api";

export const FREE_DAILY_LIMIT = 7;

/** Matches `aixpense/src/app/api/chat/route.ts` 403 body. */
export const TRIAL_LIMIT_ERROR_MESSAGE =
  "No free trials remaining. Upgrade to premium.";

export interface TrialsData {
  freeTrials: number | null;
  isPremium: boolean;
}

export const TRIALS_QUERY_KEY = ["user", "trials"] as const;

export function trialUsage(freeTrials: number) {
  const remaining = Math.max(0, Math.min(freeTrials, FREE_DAILY_LIMIT));
  const used = FREE_DAILY_LIMIT - remaining;
  const remainingPercent = (remaining / FREE_DAILY_LIMIT) * 100;
  return { remaining, used, remainingPercent, exhausted: remaining <= 0 };
}

/** AI SDK throws `response.text()` on non-OK chat responses (often JSON). */
export function isTrialLimitError(message: string): boolean {
  const lower = message.toLowerCase();
  if (lower.includes("no free trials remaining")) return true;
  if (lower.includes("upgrade to premium") && lower.includes("trial")) {
    return true;
  }
  if (message.includes("403")) return true;

  try {
    const parsed = JSON.parse(message) as { error?: unknown };
    if (typeof parsed.error === "string") {
      return isTrialLimitError(parsed.error);
    }
  } catch {
    /* not JSON */
  }

  return false;
}

export function syncTrialsExhausted(queryClient: QueryClient) {
  queryClient.setQueryData<TrialsData>(TRIALS_QUERY_KEY, (prev) => {
    if (!prev || prev.isPremium) return prev;
    return { ...prev, freeTrials: 0 };
  });
}

async function fetchTrials(): Promise<TrialsData> {
  const { data } = await api.get<TrialsData>("/api/user/trials");
  return data;
}

export function useTrials(enabled = true) {
  return useQuery<TrialsData>({
    queryKey: TRIALS_QUERY_KEY,
    queryFn: fetchTrials,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTrialActions() {
  const queryClient = useQueryClient();

  const optimisticDecrement = useCallback(() => {
    queryClient.setQueryData<TrialsData>(TRIALS_QUERY_KEY, (prev) => {
      if (!prev || prev.isPremium || prev.freeTrials === null) return prev;
      return { ...prev, freeTrials: Math.max(0, prev.freeTrials - 1) };
    });
  }, [queryClient]);

  const invalidateTrials = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: TRIALS_QUERY_KEY });
  }, [queryClient]);

  const markTrialsExhausted = useCallback(() => {
    syncTrialsExhausted(queryClient);
  }, [queryClient]);

  return { optimisticDecrement, invalidateTrials, markTrialsExhausted };
}
