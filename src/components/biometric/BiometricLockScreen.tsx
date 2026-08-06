import { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Button, useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "@/components/ui";

type Props = {
  onUnlock: () => Promise<{ success: boolean; error?: string }>;
};

/**
 * Full-screen local lock. Session remains signed in underneath.
 */
export function BiometricLockScreen({ onUnlock }: Props) {
  const [accentColor, mutedColor] = useThemeColor(["accent", "muted"]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoTried = useRef(false);

  const tryUnlock = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await onUnlock();
      if (!result.success && result.error) {
        setError(result.error);
      }
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (autoTried.current) return;
    autoTried.current = true;
    void tryUnlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- prompt once on mount
  }, []);

  return (
    <SafeAreaView
      className="absolute inset-0 z-50 flex-1 bg-background"
      edges={["top", "bottom"]}
    >
      <View className="flex-1 items-center justify-center px-8">
        <View className="size-16 rounded-2xl bg-accent/15 items-center justify-center mb-6">
          <Ionicons name="finger-print" size={34} color={accentColor} />
        </View>
        <Text className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted mb-2">
          AiXpense
        </Text>
        <Text className="text-2xl font-bold text-foreground text-center">
          Unlock to continue
        </Text>
        <Text className="text-sm text-muted text-center mt-2 leading-snug max-w-70">
          Use your fingerprint or face. You stay signed in — this only unlocks
          the app on this device.
        </Text>

        {error ? (
          <Text className="text-xs text-danger text-center mt-4">{error}</Text>
        ) : null}

        <Button
          className="mt-8 min-w-50"
          onPress={() => void tryUnlock()}
          isDisabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="lock-open-outline" size={18} color="#fff" />
              <Button.Label>Unlock</Button.Label>
            </>
          )}
        </Button>

        <Text
          className="text-[11px] text-muted text-center mt-6"
          style={{ color: mutedColor }}
        >
          Sign-in account is separate from this lock
        </Text>
      </View>
    </SafeAreaView>
  );
}
