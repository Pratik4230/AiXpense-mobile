import * as LocalAuthentication from "expo-local-authentication";
import { storage } from "@/lib/storage";

export const BIOMETRIC_LOCK_ENABLED_KEY = "biometric_app_lock_enabled";

/** Re-lock after this long in background (session stays signed in). */
export const BIOMETRIC_LOCK_GRACE_MS = 15_000;

export type BiometricAvailability = {
  hardware: boolean;
  enrolled: boolean;
  /** PIN/pattern/password and/or biometrics enrolled on the device. */
  canAuthenticate: boolean;
};

export function isBiometricLockEnabled(): boolean {
  try {
    return storage.getBoolean(BIOMETRIC_LOCK_ENABLED_KEY) === true;
  } catch {
    return false;
  }
}

export function setBiometricLockEnabled(enabled: boolean) {
  try {
    storage.set(BIOMETRIC_LOCK_ENABLED_KEY, enabled);
  } catch {
    /* SSR / no storage */
  }
}

export async function getBiometricAvailability(): Promise<BiometricAvailability> {
  try {
    const [hardware, enrolled, level] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.getEnrolledLevelAsync(),
    ]);
    return {
      hardware,
      enrolled,
      // Allow app lock when the device has a PIN/pattern and/or biometrics
      canAuthenticate: level > LocalAuthentication.SecurityLevel.NONE,
    };
  } catch {
    return { hardware: false, enrolled: false, canAuthenticate: false };
  }
}

/**
 * Local device unlock only — does not touch Better Auth / cookies.
 * Falls back to device PIN/pattern when the OS allows it.
 */
export async function authenticateAppLock(promptMessage: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const availability = await getBiometricAvailability();
    if (!availability.canAuthenticate) {
      return {
        success: false,
        error:
          "Set a screen lock (PIN, pattern, fingerprint, or face) in device settings first.",
      };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: "Cancel",
      disableDeviceFallback: false,
      biometricsSecurityLevel: "weak",
    });

    if (result.success) return { success: true };
    return {
      success: false,
      error:
        result.error === "user_cancel"
          ? "Cancelled"
          : result.error ?? "Authentication failed",
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Authentication failed",
    };
  }
}
