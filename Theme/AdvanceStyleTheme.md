> ## Documentation Index
>
> Fetch the complete documentation index at: https://docs.uniwind.dev/llms.txt
> Use this file to discover all available pages before exploring further.

# Style Based on Themes

> Learn different approaches to create theme-aware styles in Uniwind

## Overview

Uniwind provides two approaches for creating theme-aware styles: using theme variant prefixes (like `dark:`) or defining CSS variables with `@layer theme`. Each approach has its use cases and benefits.

## Approach 1: Theme Variant Prefixes

The simplest way to style components based on themes is using the `dark:` variant prefix.

### Basic Usage

By default, styles apply to all themes:

```tsx theme={null}
import { View } from "react-native";

// This red background applies to both light and dark themes
<View className="bg-red-500" />;
```

Add theme-specific styles using the `dark:` prefix:

```tsx theme={null}
import { View } from "react-native";

// Red in light mode, darker red in dark mode
<View className="bg-red-500 dark:bg-red-600" />;
```

### Multiple Theme-Specific Styles

You can combine multiple theme-aware utilities:

```tsx theme={null}
import { View, Text } from "react-native";

export const Card = () => (
  <View
    className="
    bg-white dark:bg-gray-900
    border border-gray-200 dark:border-gray-700
    shadow-sm dark:shadow-lg
    p-4 rounded-lg
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
      Card description with theme-aware colors
    </Text>
  </View>
);
```

### When to Use Theme Variant Prefixes

<Tip>
  **Best for:** One-off styling, prototyping, or small components where you want explicit control over light and dark mode colors.
</Tip>

**Pros:**

- Explicit and easy to understand
- No setup required
- Full control over each theme's appearance
- Works great for small apps or prototypes

**Cons:**

- Verbose for larger apps
- Requires repeating `dark:` prefix for many properties
- Difficult to maintain consistent colors across components
- Doesn't scale well to 3+ themes

## Approach 2: CSS Variables with @layer theme

For larger applications, defining theme-specific CSS variables provides a more scalable and maintainable solution.

### Setting Up CSS Variables

Define your theme variables in `global.css`:

```css global.css theme={null}
@import "tailwindcss";
@import "uniwind";

@layer theme {
  :root {
    @variant dark {
      --color-background: #000000;
      --color-foreground: #ffffff;
      --color-card: #1f2937;
      --color-border: #374151;
      --color-muted: #6b7280;
    }

    @variant light {
      --color-background: #ffffff;
      --color-foreground: #000000;
      --color-card: #ffffff;
      --color-border: #e5e7eb;
      --color-muted: #9ca3af;
    }
  }
}
```

### Using CSS Variables

Reference your variables directly in components:

```tsx theme={null}
import { View, Text } from "react-native";

export const Card = () => (
  <View className="bg-card border border-border p-4 rounded-lg">
    <Text className="text-foreground text-lg font-bold">Card Title</Text>
    <Text className="text-muted mt-2">
      Card description that automatically adapts to the theme
    </Text>
  </View>
);
```

<Info>
  `bg-background` automatically resolves to `#ffffff` in light theme and `#000000` in dark theme. No `dark:` prefix needed!
</Info>

### When to Use CSS Variables

<Tip>
  **Best for:** Medium to large applications, design systems, or apps with consistent color palettes across many components.
</Tip>

**Pros:**

- Clean, maintainable code
- Consistent colors across the entire app
- Easy to update themes in one place
- Scales well to any number of themes
- Semantic naming improves code readability

**Cons:**

- Requires initial setup
- Less explicit than variant prefixes
- Need to define all variables upfront

## Supporting Multiple Themes

CSS variables make it easy to support unlimited custom themes:

```css global.css theme={null}
@layer theme {
  :root {
    @variant dark {
      --color-background: #000000;
      --color-foreground: #ffffff;
      --color-primary: #3b82f6;
    }

    @variant light {
      --color-background: #ffffff;
      --color-foreground: #000000;
      --color-primary: #3b82f6;
    }

    @variant ocean {
      --color-background: #0c4a6e;
      --color-foreground: #e0f2fe;
      --color-primary: #06b6d4;
    }

    @variant sunset {
      --color-background: #7c2d12;
      --color-foreground: #fef3c7;
      --color-primary: #f59e0b;
    }
  }
}
```

Components using these variables automatically work with all themes:

```tsx theme={null}
import { View, Text } from "react-native";

export const ThemedComponent = () => (
  <View className="bg-background p-4">
    <Text className="text-foreground">
      This component works with light, dark, ocean, and sunset themes!
    </Text>
    <View className="bg-primary mt-4 p-2 rounded">
      <Text className="text-background">Primary action</Text>
    </View>
  </View>
);
```

<Tip>
  To register additional themes, follow the [Custom Themes](/theming/custom-themes) guide.
</Tip>

## Migration Guide

### From Theme Variants to CSS Variables

1. **Identify repeated colors** across your components
2. **Define CSS variables** for these colors in `global.css`
3. **Replace theme variants** with CSS variable references
4. **Test thoroughly** in all themes

Example migration:

```tsx theme={null}
// Before: Using theme variants
<View className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
  <Text className="text-gray-900 dark:text-white">Hello</Text>
</View>

// After: Using CSS variables
<View className="bg-card border border-border">
  <Text className="text-foreground">Hello</Text>
</View>
```

## Related

<CardGroup cols={2}>
  <Card title="Theming Basics" icon="palette" href="/theming/basics">
    Learn the fundamentals of theming in Uniwind
  </Card>

  <Card title="Global CSS" icon="css" href="/theming/global-css">
    Configure global styles and CSS variables
  </Card>

  <Card title="Custom Themes" icon="swatchbook" href="/theming/custom-themes">
    Create custom themes beyond light and dark
  </Card>

  <Card title="useUniwind Hook" icon="code" href="/api/use-uniwind">
    Access theme information in your components
  </Card>
</CardGroup>
