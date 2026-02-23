> ## Documentation Index
>
> Fetch the complete documentation index at: https://docs.uniwind.dev/llms.txt
> Use this file to discover all available pages before exploring further.

# Theming Basics

> Learn how to use and manage themes in Uniwind

## Overview

Uniwind provides a powerful theming system that allows you to create beautiful, consistent user interfaces that adapt to user preferences. By default, Uniwind includes three pre-configured themes: `light`, `dark`, and `system`.

## Default Themes

Uniwind pre-registers three themes out of the box, so you can start using them immediately without any configuration.

### Available Themes

| Theme    | Description                                                        |
| -------- | ------------------------------------------------------------------ |
| `light`  | Light theme                                                        |
| `dark`   | Dark theme                                                         |
| `system` | Automatically follows the device's system color scheme preferences |

### Light and Dark Themes

If you only need `light` and `dark` themes, you're all set! Uniwind automatically registers these themes for you, and you can start using theme-based class variants immediately:

```tsx theme={null}
import { View, Text } from "react-native";

export const ThemedComponent = () => (
  <View className="bg-white dark:bg-gray-900 p-4">
    <Text className="text-gray-900 dark:text-white">
      This text adapts to the current theme
    </Text>
  </View>
);
```

### System Theme

The `system` theme is a special theme that automatically syncs with your device's color scheme. When enabled, your app will automatically switch between light and dark themes based on the user's device settings.

<Tip>
  Using the `system` theme provides the best user experience, as it respects the user's device-wide preferences.
</Tip>

## Default Configuration

Here are the default values that Uniwind uses for theming:

<ParamField path="themes" type="Array<string>">
  The list of available themes.

**Default:**

```ts theme={null}
["light", "dark", "system"];
```

</ParamField>

<ParamField path="adaptiveThemes" type="boolean">
  Whether themes automatically adapt to the device's color scheme.

**Default:**

```ts theme={null}
true;
```

</ParamField>

<ParamField path="initialTheme" type="string">
  The theme that's applied when the app first launches.

**Default:**

```ts theme={null}
"light" | "dark";
```

Automatically determined based on your device's current color scheme.
</ParamField>

## Changing Themes

You can programmatically change the active theme at runtime using the `setTheme` function.

### Switch to a Specific Theme

```tsx theme={null}
import { Uniwind } from "uniwind";

// Switch to dark theme
Uniwind.setTheme("dark");

// Switch to light theme
Uniwind.setTheme("light");
```

<Info>
  When you set the theme to `light` or `dark`, Uniwind automatically calls React Native's [`Appearance.setColorScheme`](https://reactnative.dev/docs/appearance). This ensures native components like `Alert`, `Modal`, and system dialogs match your app's theme.
</Info>

<Warning>
  Switching from `system` to `light` or `dark` disables adaptive themes. The app will stay on the selected theme even if the device color scheme changes.
</Warning>

### Enable System Theme

To enable automatic theme switching based on the device's color scheme:

```tsx theme={null}
import { Uniwind } from "uniwind";

// Enable system theme (adaptive themes)
Uniwind.setTheme("system");
```

<Tip>
  Setting the theme to `system` re-enables adaptive themes, allowing your app to automatically follow device color scheme changes.
</Tip>

### Creating a Theme Switcher

Here's a complete example of a theme switcher component:

```tsx theme={null}
import { View, Pressable, Text } from "react-native";
import { Uniwind, useUniwind } from "uniwind";

export const ThemeSwitcher = () => {
  const { theme, hasAdaptiveThemes } = useUniwind();

  const themes = [
    { name: "light", label: "Light", icon: "☀️" },
    { name: "dark", label: "Dark", icon: "🌙" },
    { name: "system", label: "System", icon: "⚙️" },
  ];
  const activeTheme = hasAdaptiveThemes ? "system" : theme;

  return (
    <View className="p-4 gap-4">
      <Text className="text-sm text-gray-600 dark:text-gray-300">
        Current: {activeTheme}
      </Text>

      <View className="flex-row gap-2">
        {themes.map((t) => (
          <Pressable
            key={t.name}
            onPress={() => Uniwind.setTheme(t.name)}
            className={`
              px-4 py-3 rounded-lg items-center
              ${
                activeTheme === t.name
                  ? "bg-blue-500"
                  : "bg-gray-200 dark:bg-gray-700"
              }
            `}
          >
            <Text className="text-2xl mb-1">{t.icon}</Text>
            <Text
              className={`text-xs ${
                activeTheme === t.name
                  ? "text-white"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};
```

## Accessing Theme Information

Uniwind exposes a global object that provides information about the current theme state.

### Runtime Theme Information

You can access theme information programmatically:

```tsx theme={null}
import { Uniwind } from "uniwind";

// Get the current theme name
console.log(Uniwind.currentTheme); // e.g., 'light', 'dark', or 'system'

// Check if adaptive themes are enabled
console.log(Uniwind.hasAdaptiveThemes); // e.g., true or false
```

### Using the useUniwind Hook

For React components, use the `useUniwind` hook to access theme information and automatically re-render when the theme changes:

```tsx theme={null}
import { useUniwind } from "uniwind";
import { View, Text } from "react-native";

export const ThemeDisplay = () => {
  const { theme, hasAdaptiveThemes } = useUniwind();

  return (
    <View className="p-4">
      <Text className="text-lg font-bold">Current theme: {theme}</Text>
      <Text className="text-sm text-gray-600 dark:text-gray-300 mt-1">
        {hasAdaptiveThemes ? "Following system theme" : "Fixed theme"}
      </Text>
    </View>
  );
};
```

## API Reference

### Uniwind Global Object

<ParamField path="setTheme" type="(themeName: string) => void">
  Changes the active theme at runtime.

**Parameters:**

- `themeName`: The name of the theme to activate (`'light'`, `'dark'`, `'system'`, or a custom theme name)
  </ParamField>

<ParamField path="currentTheme" type="string">
  The name of the currently active theme.

**Returns:** `'light'`, `'dark'`, `'system'`, or a custom theme name
</ParamField>

<ParamField path="hasAdaptiveThemes" type="boolean">
  Indicates whether adaptive themes are currently enabled.

**Returns:** `true` if adaptive themes are enabled, `false` otherwise
</ParamField>

<ParamField path="updateCSSVariables" type="(theme: string, variables: Record<string, string | number>) => void">
  Dynamically updates CSS variables at runtime for a specific theme.

**Parameters:**

- `theme`: The name of the theme to update (`'light'`, `'dark'`, or a custom theme name)
- `variables`: An object mapping CSS variable names (with `--` prefix) to their new values

  <Info>
    For detailed usage examples and platform-specific behavior, see the [updateCSSVariables documentation](/theming/update-css-variables).
  </Info>
</ParamField>

## Using Theme Variants in ClassNames

Apply different styles based on the active theme using the `dark:` variant:

```tsx theme={null}
import { View, Text } from "react-native";

export const Card = () => (
  <View
    className="
    bg-white dark:bg-gray-800
    border border-gray-200 dark:border-gray-700
    p-6 rounded-lg
    shadow-sm dark:shadow-lg
  "
  >
    <Text
      className="
      text-gray-900 dark:text-white
      text-lg font-bold
    "
    >
      Card Title
    </Text>
    <Text
      className="
      text-gray-600 dark:text-gray-300
      mt-2
    "
    >
      Card content adapts to the theme automatically
    </Text>
  </View>
);
```

## Best Practices

<Tip>
  **Use semantic color names:** Instead of hardcoding colors, define theme-aware color tokens in your Tailwind config for better consistency.
</Tip>

<Tip>
  **Test both themes:** Always test your UI in both light and dark themes to ensure proper contrast and readability.
</Tip>

<Warning>
  **Avoid theme-specific logic in components:** Let the styling system handle theme switching. Keep your component logic theme-agnostic.
</Warning>

## Related

<CardGroup cols={2}>
  <Card title="Custom Themes" icon="swatchbook" href="/theming/custom-themes">
    Learn how to create custom themes beyond light and dark
  </Card>

  <Card title="useUniwind Hook" icon="code" href="/api/use-uniwind">
    Access theme information in your React components
  </Card>

  <Card title="Global CSS" icon="css" href="/theming/global-css">
    Define global CSS variables for your themes
  </Card>

  <Card title="Update CSS Variables" icon="wand-magic-sparkles" href="/theming/update-css-variables">
    Dynamically update CSS variables at runtime
  </Card>

  <Card title="Style Based on Themes" icon="paintbrush" href="/theming/style-based-on-themes">
    Advanced theme-based styling techniques
  </Card>
</CardGroup>
