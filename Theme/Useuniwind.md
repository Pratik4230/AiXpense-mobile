> ## Documentation Index
>
> Fetch the complete documentation index at: https://docs.uniwind.dev/llms.txt
> Use this file to discover all available pages before exploring further.

# useUniwind

> React hook for accessing the current theme and reacting to theme changes

## Overview

The `useUniwind` hook provides access to the current theme name and adaptive theme status. It automatically triggers a re-render when the theme changes or when adaptive themes are toggled. This is useful when you need to conditionally render components or apply logic based on the active theme.

## Usage

```tsx theme={null}
import { useUniwind } from "uniwind";

export const MyComponent = () => {
  const { theme, hasAdaptiveThemes } = useUniwind();

  return (
    <View className="p-4">
      <Text>Current theme: {theme}</Text>
      <Text>Adaptive themes: {hasAdaptiveThemes ? "enabled" : "disabled"}</Text>
    </View>
  );
};
```

## When to Use This Hook

The `useUniwind` hook is ideal for scenarios where you need to:

- Display the current theme name in your UI
- Check if adaptive themes (system theme) are enabled
- Conditionally render different components based on the active theme
- Execute side effects when the theme changes
- Access theme information for logging or analytics

<Tip>
  For most styling use cases, you don't need this hook. Use theme-based className variants instead (e.g., `dark:bg-gray-900`).
</Tip>

## Return Values

<ParamField path="theme" type="string">
  The name of the currently active theme (e.g., `"light"`, `"dark"`, `"system"`, or any custom theme name you've defined).
</ParamField>

<ParamField path="hasAdaptiveThemes" type="boolean">
  Indicates whether adaptive themes are currently enabled. When `true`, the app automatically follows the device's system color scheme. When `false`, the app uses a fixed theme.
</ParamField>

## Examples

### Conditional Rendering Based on Theme

```tsx theme={null}
import { useUniwind } from "uniwind";
import { View, Text } from "react-native";

export const ThemedIcon = () => {
  const { theme } = useUniwind();

  return (
    <View className="p-4">
      {theme === "dark" ? (
        <MoonIcon className="text-white" />
      ) : (
        <SunIcon className="text-yellow-500" />
      )}
    </View>
  );
};
```

### Using Theme in Side Effects

```tsx theme={null}
import { useUniwind } from "uniwind";
import { useEffect } from "react";

export const ThemeLogger = () => {
  const { theme } = useUniwind();

  useEffect(() => {
    console.log("Theme changed to:", theme);
    // You could also:
    // - Update analytics
    // - Store preference in MMKV storage
    // - Trigger additional theme-related logic
  }, [theme]);

  return null;
};
```

### Displaying Current Theme

```tsx theme={null}
import { useUniwind } from "uniwind";
import { View, Text } from "react-native";

export const ThemeIndicator = () => {
  const { theme, hasAdaptiveThemes } = useUniwind();

  return (
    <View className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
      <Text className="text-sm text-gray-600 dark:text-gray-300">
        Active theme: {theme}
      </Text>
      <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {hasAdaptiveThemes ? "Following system theme" : "Fixed theme"}
      </Text>
    </View>
  );
};
```

### Reacting to Adaptive Theme Changes

```tsx theme={null}
import { useUniwind } from "uniwind";
import { useEffect } from "react";

export const AdaptiveThemeMonitor = () => {
  const { theme, hasAdaptiveThemes } = useUniwind();

  useEffect(() => {
    if (hasAdaptiveThemes) {
      console.log("System theme changed to:", theme);
      // Handle system theme change
      // - Update status bar style
      // - Log analytics event
      // - Sync with backend preferences
    }
  }, [theme, hasAdaptiveThemes]);

  return null;
};
```

## Related

<CardGroup cols={2}>
  <Card title="Theming Basics" icon="palette" href="/theming/basics">
    Learn how to set up and configure themes in Uniwind
  </Card>

  <Card title="Custom Themes" icon="swatchbook" href="/theming/custom-themes">
    Create and manage custom theme configurations
  </Card>
</CardGroup>
