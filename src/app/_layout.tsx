import "../../polyfills";
import "../../global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Uniwind } from "uniwind";
import { authClient } from "@/lib/authClient";
import { storage, THEME_KEY } from "@/lib/storage";
import { HeroUINativeProvider, type HeroUINativeConfig } from "heroui-native";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
});

const heroConfig: HeroUINativeConfig = {
  textProps: { maxFontSizeMultiplier: 1.5 },
  devInfo: { stylingPrinciples: false },
};

/** Don't block forever if session/fonts stall (network / SecureStore). */
const BOOT_TIMEOUT_MS = 8_000;

export default function RootLayout() {
  const { data: session, isPending } = authClient.useSession();
  const [bootTimedOut, setBootTimedOut] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const fontsReady = fontsLoaded || fontError != null;
  const authSettled = !isPending;
  const appReady = (fontsReady && authSettled) || bootTimedOut;
  const resolvedSession = authSettled ? (session ?? null) : null;

  useEffect(() => {
    const saved = storage.getString(THEME_KEY) as
      | "light"
      | "dark"
      | "system"
      | undefined;
    // Match app.json userInterfaceStyle: "dark" when no preference saved
    Uniwind.setTheme(saved ?? "dark");
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setBootTimedOut(true), BOOT_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!appReady) return;
    SplashScreen.hideAsync().catch(() => {});
  }, [appReady]);

  if (!appReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000000" }}>
      <KeyboardProvider>
        <HeroUINativeProvider config={heroConfig}>
          <QueryClientProvider client={queryClient}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Protected guard={!resolvedSession}>
                <Stack.Screen name="(auth)" />
              </Stack.Protected>
              <Stack.Protected guard={!!resolvedSession}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="transactions"
                  options={{ presentation: "card" }}
                />
                <Stack.Screen
                  name="recurring"
                  options={{ presentation: "card" }}
                />
                <Stack.Screen
                  name="currency"
                  options={{
                    presentation: "formSheet",
                    headerShown: false,
                    sheetAllowedDetents: [0.55, 0.92],
                    sheetInitialDetentIndex: 1,
                    sheetGrabberVisible: true,
                    sheetCornerRadius: 24,
                  }}
                />
              </Stack.Protected>
            </Stack>
          </QueryClientProvider>
        </HeroUINativeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
