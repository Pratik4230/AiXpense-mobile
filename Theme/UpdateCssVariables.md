> ## Documentation Index
>
> Fetch the complete documentation index at: https://docs.uniwind.dev/llms.txt
> Use this file to discover all available pages before exploring further.

# updateCSSVariables

> Dynamically update CSS variables at runtime for specific themes

<Badge>Available in Uniwind 1.1.0+</Badge>

## Overview

The `updateCSSVariables` method allows you to dynamically modify CSS variable values at runtime for a specific theme. This is useful for creating user-customizable themes, implementing dynamic color schemes, or adapting styles based on runtime conditions.

<Info>
  Variable changes are persisted per theme, so switching between themes will preserve the custom values you've set for each one.
</Info>

## When to Use This Method

Use `updateCSSVariables` when you need to:

- Build user-customizable themes (e.g., custom accent colors, spacing preferences)
- Implement dynamic brand theming (e.g., white-label apps)
- Adjust theme colors based on runtime data (e.g., user preferences, A/B testing)
- Create theme editors or design tools within your app
- Adapt colors based on external factors (e.g., time of day, location)

<Tip>
  **For static theme customization**, prefer defining variables directly in your `global.css` file using `@theme` and `@variant` directives.
</Tip>

## Usage

### Basic Example

```tsx theme={null}
import { Uniwind } from "uniwind";

// Update a single variable for the light theme
Uniwind.updateCSSVariables("light", {
  "--color-primary": "#ff6b6b",
});
```

### Multiple Variables at Once

```tsx theme={null}
import { Uniwind } from "uniwind";

// Update multiple variables for the dark theme
Uniwind.updateCSSVariables("dark", {
  "--color-primary": "#4ecdc4",
  "--color-secondary": "#ffe66d",
  "--color-background": "#1a1a2e",
  "--spacing": 16,
});
```

### User-Customizable Theme

```tsx theme={null}
import { Uniwind } from "uniwind";
import { View, Button } from "react-native";

export const ThemeCustomizer = () => {
  const applyCustomColors = (accentColor: string, backgroundColor: string) => {
    Uniwind.updateCSSVariables(Uniwind.currentTheme, {
      "--color-accent": accentColor,
      "--color-background": backgroundColor,
    });
  };

  return (
    <View className="p-4">
      <Button
        title="Ocean Theme"
        onPress={() => applyCustomColors("#0077be", "#e0f7fa")}
      />
      <Button
        title="Sunset Theme"
        onPress={() => applyCustomColors("#ff6b35", "#fff5e6")}
      />
      <Button
        title="Forest Theme"
        onPress={() => applyCustomColors("#2d6a4f", "#d8f3dc")}
      />
    </View>
  );
};
```

## How It Works

`updateCSSVariables` modifies CSS variables for a specific theme and persists those changes. The variables you update can be:

- **Scoped theme variables**: Variables defined inside `@variant` blocks (e.g., `@variant light { --color-primary: ... }`)
- **Shared variables**: Variables defined in `@theme` that are available across all themes

When you switch themes, your customized values are preserved and applied automatically.

### Variable Persistence

```tsx theme={null}
// Customize the light theme
Uniwind.updateCSSVariables("light", {
  "--color-primary": "#ff6b6b",
});

// Switch to dark theme
Uniwind.setTheme("dark");

// Switch back to light theme
Uniwind.setTheme("light");
// ✅ The custom --color-primary value is still applied
```

## API Reference

### Method Signature

```typescript theme={null}
Uniwind.updateCSSVariables(theme: string, variables: Record<string, string | number>): void
```

### Parameters

<ParamField path="theme" type="string" required>
  The name of the theme to update. This should match a theme name defined in your `global.css` file (e.g., `'light'`, `'dark'`, or custom theme names).
</ParamField>

<ParamField path="variables" type="Record<string, string | number>" required>
  An object mapping CSS variable names (with `--` prefix) to their new values.

- **Keys**: Must be valid CSS variable names starting with `--` (validated in development mode)
- **Values**: Can be strings (colors, units) or numbers (numeric values like spacing)

```tsx theme={null}
{
  '--color-primary': '#3b82f6',     // String color
  '--spacing': 16,             // Number (converted to px on web)
  '--radius-sm': 8,
}
```

</ParamField>

### Return Value

This method returns `void`. It updates the CSS variables immediately and triggers a re-render if the updated theme is currently active.

## Platform Differences

<Accordion title="Web Platform" icon="globe">
  On web, `updateCSSVariables` applies changes directly to the DOM using `document.documentElement.style.setProperty()`:

- Numeric values are automatically converted to pixel units (e.g., `16` becomes `"16px"`)
- String values are applied as-is
- Changes take effect immediately
- Updates trigger listener notifications if the modified theme is active

```tsx theme={null}
// Web behavior
Uniwind.updateCSSVariables("light", {
  "--spacing": 16, // Applied as "16px"
  "--color-primary": "#3b82f6", // Applied as "#3b82f6"
});
```

</Accordion>

<Accordion title="Native Platform" icon="mobile">
  On React Native, `updateCSSVariables` updates the internal variable store with normalized values:

- Color values are parsed and normalized to hex format using Culori
- Numeric values are stored directly as numbers
- Variables are added as getters to both `UniwindStore.vars` and theme-specific variable objects
- Updates trigger listener notifications if the modified theme is active

```tsx theme={null}
// Native behavior
Uniwind.updateCSSVariables("light", {
  "--spacing": 16, // Stored as 16
  "--color-primary": "rgb(59, 130, 246)", // Normalized to "#3b82f6"
});
```

</Accordion>

## Important Notes

<Warning>
  CSS variable names must include the `--` prefix. In development mode, Uniwind will validate this and warn you if you forget the prefix.
</Warning>

```tsx theme={null}
// ✅ Correct
Uniwind.updateCSSVariables("light", {
  "--color-primary": "#ff0000",
});

// ❌ Will show a warning in development
Uniwind.updateCSSVariables("light", {
  "color-primary": "#ff0000", // Missing -- prefix
});
```

<Info>
  Updates only trigger component re-renders if the modified theme is currently active. Updating an inactive theme will store the changes but won't cause immediate visual updates.
</Info>

## Making Variables Available

For `updateCSSVariables` to work with a CSS variable, the variable must be defined in your theme. There are two ways to ensure variables are available:

### Option 1: Define in Theme Variants

Define variables inside `@variant` blocks in your `global.css`:

```css global.css theme={null}
@import "tailwindcss";
@import "uniwind";

@layer theme {
  :root {
    @variant light {
      --color-primary: #3b82f6;
      --color-background: #ffffff;
    }

    @variant dark {
      --color-primary: #60a5fa;
      --color-background: #1f2937;
    }
  }
}
```

Now you can update these variables at runtime:

```tsx theme={null}
Uniwind.updateCSSVariables("light", {
  "--color-primary": "#ff0000", // ✅ Works
});
```

### Option 2: Define in Shared Theme

Define variables in `@theme` to make them available across all themes:

```css global.css theme={null}
@import "tailwindcss";
@import "uniwind";

@theme {
  --color-brand-primary: #3b82f6;
  --color-brand-secondary: #8b5cf6;
  --spacing-custom: 24px;
}
```

These can be updated for any theme:

```tsx theme={null}
Uniwind.updateCSSVariables("light", {
  "--color-brand-primary": "#ff6b6b", // ✅ Works
  "--spacing-custom": 32, // ✅ Works
});
```

## Performance Considerations

<Info>
  `updateCSSVariables` is optimized to only trigger re-renders when necessary. Updates to inactive themes don't cause re-renders.
</Info>

Keep in mind:

- Changes are applied synchronously and take effect immediately
- Only components using the updated variables will re-render (if the theme is active)
- Updating variables frequently (e.g., on every slider drag) is fine, but consider debouncing for very rapid updates
- Variables are stored per theme, so memory usage scales with the number of themes and customized variables

## Related

<CardGroup cols={2}>
  <Card title="useCSSVariable" icon="code" href="/api/use-css-variable">
    Read CSS variable values in JavaScript
  </Card>

  <Card title="Custom Themes" icon="palette" href="/theming/custom-themes">
    Learn how to create custom themes
  </Card>

  <Card title="Global CSS" icon="css" href="/theming/global-css">
    Define CSS variables in your theme configuration
  </Card>

  <Card title="Theming Basics" icon="palette" href="/theming/basics">
    Understand how themes work in Uniwind
  </Card>
</CardGroup>
