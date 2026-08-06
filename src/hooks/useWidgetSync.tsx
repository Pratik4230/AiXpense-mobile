import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";
import { requestWidgetUpdate } from "react-native-android-widget";
import { TodaySpendWidget } from "@/widget/TodaySpendWidget";
import {
  TODAY_SPEND_WIDGET_NAME,
  refreshTodaySpendSnapshot,
} from "@/widget/todaySpend";

/**
 * Keeps the Android home-screen widget in sync while the app is open.
 */
export function useWidgetSync(enabled: boolean) {
  const syncingRef = useRef(false);

  useEffect(() => {
    if (Platform.OS !== "android" || !enabled) return;

    const sync = async () => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      try {
        const data = await refreshTodaySpendSnapshot();
        await requestWidgetUpdate({
          widgetName: TODAY_SPEND_WIDGET_NAME,
          renderWidget: () => <TodaySpendWidget data={data} />,
        });
      } catch {
        /* no widget on home screen / native module missing in Expo Go */
      } finally {
        syncingRef.current = false;
      }
    };

    void sync();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void sync();
    });

    return () => sub.remove();
  }, [enabled]);
}
