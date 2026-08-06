import { useCallback, useEffect, useState } from "react";
import { View, Text, Alert, Platform, Switch } from "react-native";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { getBiometricAvailability } from "@/lib/biometricLock";
import {
  getBiometricLockSnapshot,
  setBiometricLockPreference,
  subscribeBiometricLock,
} from "@/lib/biometricLockStore";

/**
 * Profile toggle for local app lock. Independent of Better Auth password / OTP.
 * Toggling only saves the preference — biometrics run on the lock screen later.
 */
export function BiometricLockToggle() {
  const [accentColor] = useThemeColor(["accent"]);
  const [enabled, setEnabled] = useState(
    () => getBiometricLockSnapshot().enabled,
  );
  const [supported, setSupported] = useState(true);
  const [checking, setChecking] = useState(Platform.OS !== "web");

  useEffect(() => {
    return subscribeBiometricLock(() => {
      setEnabled(getBiometricLockSnapshot().enabled);
    });
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return;
    let cancelled = false;
    void getBiometricAvailability()
      .then((a) => {
        if (!cancelled) setSupported(a.canAuthenticate);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const onValueChange = useCallback(
    (next: boolean) => {
      if (next && !supported) {
        Alert.alert(
          "Screen lock required",
          "Set a PIN, pattern, fingerprint, or face unlock in your device settings first.",
        );
        return;
      }
      // Preference only — does not replace Better Auth login
      setBiometricLockPreference(next, { unlockNow: true });
      setEnabled(next);
    },
    [supported],
  );

  if (Platform.OS === "web") return null;

  return (
    <View className="flex-row items-center justify-between gap-3 py-1">
      <View className="flex-row items-center gap-2.5 flex-1 min-w-0">
        <View className="size-9 rounded-xl bg-accent/12 items-center justify-center">
          <Ionicons name="finger-print" size={18} color={accentColor} />
        </View>
        <View className="flex-1 min-w-0">
          <Text className="text-sm font-semibold text-foreground">
            App lock
          </Text>
          <Text className="text-xs text-muted mt-0.5 leading-snug">
            {supported
              ? "Lock AiXpense with fingerprint, face, or device PIN. Separate from sign-in."
              : "Set up a screen lock in device settings to use this."}
          </Text>
        </View>
      </View>
      <Switch
        value={enabled}
        onValueChange={onValueChange}
        disabled={checking}
        trackColor={{ false: "#27272a", true: accentColor }}
        thumbColor="#fafafa"
        ios_backgroundColor="#27272a"
        accessibilityLabel="App lock"
      />
    </View>
  );
}
