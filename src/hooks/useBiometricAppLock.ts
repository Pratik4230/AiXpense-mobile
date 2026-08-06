import { useCallback, useEffect, useSyncExternalStore } from "react";
import { AppState, Platform } from "react-native";
import {
  authenticateAppLock,
  getBiometricAvailability,
} from "@/lib/biometricLock";
import {
  clearBackgroundTimestamp,
  getBiometricLockSnapshot,
  noteAppBackgrounded,
  onAuthSessionEnded,
  setBiometricUnlocked,
  shouldRelockAfterBackground,
  subscribeBiometricLock,
} from "@/lib/biometricLockStore";

/**
 * Local biometric gate after Better Auth login.
 * Does not sign the user out — only hides app UI until device unlock succeeds.
 */
export function useBiometricAppLock(hasSession: boolean) {
  const snapshot = useSyncExternalStore(
    subscribeBiometricLock,
    getBiometricLockSnapshot,
    getBiometricLockSnapshot,
  );

  useEffect(() => {
    if (!hasSession) {
      onAuthSessionEnded();
    }
  }, [hasSession]);

  useEffect(() => {
    if (!hasSession || !snapshot.enabled) return;

    const sub = AppState.addEventListener("change", (next) => {
      if (next === "background" || next === "inactive") {
        noteAppBackgrounded();
        return;
      }
      if (next === "active" && shouldRelockAfterBackground()) {
        setBiometricUnlocked(false);
      }
      clearBackgroundTimestamp();
    });

    return () => sub.remove();
  }, [hasSession, snapshot.enabled]);

  const isLocked =
    Platform.OS !== "web" &&
    hasSession &&
    snapshot.enabled &&
    !snapshot.unlocked;

  const unlock = useCallback(async () => {
    const result = await authenticateAppLock("Unlock AiXpense");
    if (result.success) {
      setBiometricUnlocked(true);
      clearBackgroundTimestamp();
      return { success: true as const };
    }
    return { success: false as const, error: result.error };
  }, []);

  return {
    isLocked,
    enabled: snapshot.enabled,
    unlock,
    getAvailability: getBiometricAvailability,
  };
}
