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

let unlocked = true;
let backgroundedAt: number | null = null;
const listeners = new Set<() => void>();
let initialized = false;

/** Stable reference for useSyncExternalStore — must not allocate on every read. */
let cachedSnapshot: Snapshot = {
  enabled: false,
  unlocked: true,
};

/**
 * Lazy init — reading MMKV at module load breaks Expo Router server/web export.
 */
function ensureInit() {
  if (initialized) return;
  initialized = true;
  try {
    const enabled = isBiometricLockEnabled();
    unlocked = !enabled;
    cachedSnapshot = { enabled, unlocked };
  } catch {
    // SSR / no native storage
    cachedSnapshot = { enabled: false, unlocked: true };
  }
}

function emitIfChanged() {
  ensureInit();
  const nextEnabled = (() => {
    try {
      return isBiometricLockEnabled();
    } catch {
      return false;
    }
  })();
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
  ensureInit();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getBiometricLockSnapshot(): Snapshot {
  ensureInit();
  return cachedSnapshot;
}

export function setBiometricUnlocked(value: boolean) {
  ensureInit();
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
  ensureInit();
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
  ensureInit();
  let enabled = false;
  try {
    enabled = isBiometricLockEnabled();
  } catch {
    enabled = false;
  }
  const nextUnlocked = !enabled;
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
  try {
    if (!isBiometricLockEnabled()) return false;
  } catch {
    return false;
  }
  if (backgroundedAt == null) return false;
  return Date.now() - backgroundedAt >= BIOMETRIC_LOCK_GRACE_MS;
}

export function clearBackgroundTimestamp() {
  backgroundedAt = null;
}
