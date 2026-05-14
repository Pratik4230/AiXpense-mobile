import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useLayoutEffect, useMemo, type ReactNode } from "react";
import { Platform } from "react-native";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import {
  AndroidSoftInputModes,
  KeyboardController,
  KeyboardStickyView,
  useGenericKeyboardHandler,
} from "react-native-keyboard-controller";

type Props = { children: ReactNode };

/**
 * iOS: `KeyboardStickyView` (resize + sticky is correct there).
 *
 * Android: `KeyboardStickyView` calls `useKeyboardAnimation` → `useResizeMode` →
 * `SOFT_INPUT_ADJUST_RESIZE`, while the sticky view also applies a keyboard-height
 * `translateY` — two independent lifts → gap above the IME. Here we use
 * `ADJUST_NOTHING` for this subtree lifecycle and only the translate from
 * `useGenericKeyboardHandler` (which does not enable resize).
 *
 * Tab bar: keyboard `height` is from the window bottom, while the composer
 * sits above the bottom tab bar. Subtract that bar height so the lift matches
 * the IME top (avoids a persistent strip the size of the tab bar).
 */
export function ComposerKeyboardOrSticky({ children }: Props) {
  if (Platform.OS === "ios") {
    return (
      <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
        {children}
      </KeyboardStickyView>
    );
  }

  return <AndroidComposerKeyboardLift>{children}</AndroidComposerKeyboardLift>;
}

function AndroidComposerKeyboardLift({ children }: Props) {
  const tabBarHeight = useBottomTabBarHeight();
  const translateY = useSharedValue(0);

  useLayoutEffect(() => {
    KeyboardController.setInputMode(
      AndroidSoftInputModes.SOFT_INPUT_ADJUST_NOTHING,
    );
    return () => {
      KeyboardController.setDefaultMode();
    };
  }, []);

  const keyboardHandler = useMemo(
    () => ({
      onMove: (e: { height: number }) => {
        "worklet";
        translateY.value =
          e.height > 0 ? tabBarHeight - e.height : 0;
      },
      onInteractive: (e: { height: number }) => {
        "worklet";
        translateY.value =
          e.height > 0 ? tabBarHeight - e.height : 0;
      },
      onEnd: (e: { height: number }) => {
        "worklet";
        translateY.value =
          e.height > 0 ? tabBarHeight - e.height : 0;
      },
    }),
    [translateY, tabBarHeight],
  );

  useGenericKeyboardHandler(keyboardHandler, [tabBarHeight]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return <Reanimated.View style={style}>{children}</Reanimated.View>;
}
