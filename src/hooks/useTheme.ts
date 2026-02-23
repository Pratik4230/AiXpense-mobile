import { Uniwind, useUniwind } from "uniwind";
import { storage, THEME_KEY } from "@/lib/storage";

type ThemePreference = "light" | "dark" | "system";

export function useTheme() {
  const { theme, hasAdaptiveThemes } = useUniwind();

  const activePreference: ThemePreference = hasAdaptiveThemes
    ? "system"
    : (theme as ThemePreference);

  const setTheme = (preference: ThemePreference) => {
    Uniwind.setTheme(preference);
    storage.set(THEME_KEY, preference);
  };

  return { theme: activePreference, setTheme };
}
