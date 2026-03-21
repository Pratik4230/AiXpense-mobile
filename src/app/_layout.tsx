import "../../polyfills";
import "../../global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useEffect } from "react";
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

export default function RootLayout() {
  const { data: session, isPending } = authClient.useSession();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    const saved = storage.getString(THEME_KEY) as
      | "light"
      | "dark"
      | "system"
      | undefined;
    Uniwind.setTheme(saved ?? "system");
  }, []);

  useEffect(() => {
    if (fontsLoaded && !isPending) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isPending]);

  if (!fontsLoaded || isPending) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <HeroUINativeProvider config={heroConfig}>
          <QueryClientProvider client={queryClient}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Protected guard={!session}>
                <Stack.Screen name="(auth)" />
              </Stack.Protected>
              <Stack.Protected guard={!!session}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="transactions"
                  options={{ presentation: "card" }}
                />
              </Stack.Protected>
            </Stack>
          </QueryClientProvider>
        </HeroUINativeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
