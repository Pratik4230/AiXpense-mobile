import {
  BIOMETRIC_LOCK_GRACE_MS,
  isBiometricLockEnabled,
  setBiometricLockEnabled as persistEnabled,
} from "@/lib/biometricLock";

type Snapshot = {
  enabled: boolean;
  /** In-memory only — cleared on process death / cold start. */
  unlocked: boolean;
};

let unlocked = !isBiometricLockEnabled();
let backgroundedAt: number | null = null;
const listeners = new Set<() => void>();

/** Stable reference for useSyncExternalStore — must not allocate on every read. */
let cachedSnapshot: Snapshot = {
  enabled: isBiometricLockEnabled(),
  unlocked,
};

function emitIfChanged() {
  const nextEnabled = isBiometricLockEnabled();
  if (
    cachedSnapshot.enabled === nextEnabled &&
    cachedSnapshot.unlocked === unlocked
  ) {
    return;
  }
  cachedSnapshot = { enabled: nextEnabled, unlocked };
  for (const l of listeners) l();
}

export function subscribeBiometricLock(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getBiometricLockSnapshot(): Snapshot {
  return cachedSnapshot;
}

export function setBiometricUnlocked(value: boolean) {
  if (unlocked === value) return;
  unlocked = value;
  emitIfChanged();
}

/**
 * Persist preference. Enabling starts locked until the next successful unlock
 * unless `unlockNow` is true (user just authenticated to turn it on).
 */
export function setBiometricLockPreference(
  enabled: boolean,
  opts?: { unlockNow?: boolean },
) {
  persistEnabled(enabled);
  if (!enabled) {
    unlocked = true;
  } else {
    unlocked = opts?.unlockNow === true;
  }
  emitIfChanged();
}

/** Call when Better Auth session ends — keep preference, require unlock next login. */
export function onAuthSessionEnded() {
  const nextUnlocked = !isBiometricLockEnabled();
  if (unlocked === nextUnlocked && backgroundedAt == null) return;
  unlocked = nextUnlocked;
  backgroundedAt = null;
  emitIfChanged();
}

export function noteAppBackgrounded() {
  backgroundedAt = Date.now();
}

/** Returns true if the UI should re-lock after returning from background. */
export function shouldRelockAfterBackground(): boolean {
  if (!isBiometricLockEnabled()) return false;
  if (backgroundedAt == null) return false;
  return Date.now() - backgroundedAt >= BIOMETRIC_LOCK_GRACE_MS;
}

export function clearBackgroundTimestamp() {
  backgroundedAt = null;
}
