import { useEffect } from "react";
import { Alert, Platform } from "react-native";
import Constants from "expo-constants";

/**
 * Google Play in-app updates (not Expo OTA).
 * Only works on Android builds installed from Play Store / Play testing tracks.
 * Sideloaded / `expo run:android` debug installs will no-op safely.
 */
export function usePlayStoreUpdateCheck() {
  useEffect(() => {
    if (Platform.OS !== "android" || __DEV__) return;

    let cancelled = false;
    let removeStatusListener: (() => void) | undefined;

    const run = async () => {
      try {
        const mod = await import("sp-react-native-in-app-updates");
        const SpInAppUpdates = mod.default;
        const { IAUUpdateKind, IAUInstallStatus } = mod;

        const inAppUpdates = new SpInAppUpdates(false);
        const curVersion = Constants.expoConfig?.version ?? "1.0.0";
        const result = await inAppUpdates.checkNeedsUpdate({ curVersion });
        if (cancelled || !result.shouldUpdate) return;

        const onStatus = (status: { status: number }) => {
          if (status.status !== IAUInstallStatus.DOWNLOADED) return;
          Alert.alert(
            "Update ready",
            "A newer version from Google Play was downloaded. Restart to finish installing.",
            [
              { text: "Later", style: "cancel" },
              {
                text: "Restart",
                onPress: () => inAppUpdates.installUpdate(),
              },
            ],
          );
        };

        inAppUpdates.addStatusUpdateListener(onStatus);
        removeStatusListener = () =>
          inAppUpdates.removeStatusUpdateListener(onStatus);

        await inAppUpdates.startUpdate({
          updateType: IAUUpdateKind.FLEXIBLE,
        });
      } catch {
        // Play Core unavailable (not installed from Play) or check failed
      }
    };

    void run();

    return () => {
      cancelled = true;
      removeStatusListener?.();
    };
  }, []);
}
