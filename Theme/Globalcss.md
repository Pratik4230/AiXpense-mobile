> ## Documentation Index
>
> Fetch the complete documentation index at: https://docs.uniwind.dev/llms.txt
> Use this file to discover all available pages before exploring further.

# Global CSS

> Configure global styles, themes, and CSS variables in your Uniwind app

## Overview

The `global.css` file is the main entry point for Uniwind's styling system. It's where you import Tailwind and Uniwind, define theme-specific CSS variables, customize Tailwind's configuration, and add global styles for your entire application.

<Info>
  The `global.css` file must be imported in your app's entry point (usually `App.tsx`) for Uniwind to work correctly.
</Info>

## Required Imports

Every `global.css` file must include these two essential imports:

```css global.css theme={null}
/* Required: Import Tailwind CSS */
@import "tailwindcss";

/* Required: Import Uniwind */
@import "uniwind";
```

These imports enable:

- All Tailwind utility classes
- Uniwind's React Native compatibility layer
- Theme-based variants (`dark:`, `light`)
- Platform-specific variants (`ios:`, `android:`, `web:`)

## Customizing Tailwind Configuration

Use the `@theme` directive to customize Tailwind's default configuration values:

### Modifying Design Tokens

```css global.css theme={null}
@import "tailwindcss";
@import "uniwind";

@theme {
  /* Customize base font size */
  --text-base: 15px;

  /* Customize spacing scale */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;

  /* Customize border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* Add custom colors */
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --color-accent: #ec4899;
}
```

<Warning>
  **Important:** Variables in `@theme` only customize Tailwind utility classes. They do **not** apply globally to unstyled components. If you want to change the default font size for all Text components, you need to use `className="text-base"` on each component.
</Warning>

```tsx theme={null}
import { Text } from 'react-native'

// ❌ This will NOT use --text-base (uses React Native's default ~14px)
<Text>Unstyled text</Text>

// ✅ This WILL use --text-base (15px from your @theme)
<Text className="text-base">Styled text</Text>
```

### Extending the Color Palette

```css global.css theme={null}
@theme {
  /* Add brand colors */
  --color-brand-50: #eff6ff;
  --color-brand-100: #dbeafe;
  --color-brand-200: #bfdbfe;
  --color-brand-300: #93c5fd;
  --color-brand-400: #60a5fa;
  --color-brand-500: #3b82f6;
  --color-brand-600: #2563eb;
  --color-brand-700: #1d4ed8;
  --color-brand-800: #1e40af;
  --color-brand-900: #1e3a8a;
}
```

Usage:

```tsx theme={null}
<View className="bg-brand-500 text-white p-4" />
```

## Theme-Specific Variables

Define different CSS variable values for each theme using the `@layer theme` directive with `@variant`:

### Basic Theme Variables

```css global.css theme={null}
@import "tailwindcss";
@import "uniwind";

@layer theme {
  :root {
    /* Dark theme variables */
    @variant dark {
      --color-background: #000000;
      --color-foreground: #ffffff;
      --color-muted: #374151;
      --color-border: #1f2937;
    }

    /* Light theme variables */
    @variant light {
      --color-background: #ffffff;
      --color-foreground: #000000;
      --color-muted: #f3f4f6;
      --color-border: #e5e7eb;
    }
  }
}
```

### Complete Theme System

```css global.css theme={null}
@import "tailwindcss";
@import "uniwind";

@layer theme {
  :root {
    @variant dark {
      /* Backgrounds */
      --color-background: #000000;
      --color-background-secondary: #111827;
      --color-card: #1f2937;

      /* Text colors */
      --color-foreground: #ffffff;
      --color-foreground-secondary: #9ca3af;
      --color-muted: #6b7280;

      /* Borders */
      --color-border: #374151;
      --color-border-subtle: #1f2937;

      /* Interactive elements */
      --color-primary: #3b82f6;
      --color-primary-hover: #2563eb;
      --color-danger: #ef4444;
      --color-success: #10b981;
      --color-warning: #f59e0b;
    }

    @variant light {
      /* Backgrounds */
      --color-background: #ffffff;
      --color-background-secondary: #f9fafb;
      --color-card: #ffffff;

      /* Text colors */
      --color-foreground: #111827;
      --color-foreground-secondary: #6b7280;
      --color-muted: #9ca3af;

      /* Borders */
      --color-border: #e5e7eb;
      --color-border-subtle: #f3f4f6;

      /* Interactive elements */
      --color-primary: #3b82f6;
      --color-primary-hover: #2563eb;
      --color-danger: #ef4444;
      --color-success: #10b981;
      --color-warning: #f59e0b;
    }
  }
}
```

### OKLCH Color Support

Uniwind supports modern [OKLCH color space](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch), which provides more perceptually uniform colors and better color manipulation compared to traditional RGB/HSL:

```css global.css theme={null}
@layer theme {
  :root {
    @variant dark {
      --color-background: oklch(0.1316 0.0041 17.69);
      --color-foreground: oklch(0.18 0.0033 17.46);
      --color-primary: oklch(0 0 0);
      --color-inverted: oklch(1 0 0);
      --color-gray: oklch(0.452 0.0042 39.45);
    }

    @variant light {
      --color-background: oklch(1 0 0);
      --color-foreground: oklch(96.715% 0.00011 271.152);
      --color-primary: oklch(1 0 0);
      --color-inverted: oklch(0 0 0);
      --color-gray: oklch(0.9612 0 0);
    }
  }
}
```

**Benefits of OKLCH:**

- **Perceptually uniform**: Colors that look equally bright to the human eye
- **Wider color gamut**: Access to more vibrant colors on modern displays
- **Better interpolation**: Smooth color transitions without muddy intermediate colors
- **Consistent lightness**: Easier to create accessible color palettes

<Tip>
  Use [OKLCH Color Picker](https://oklch.com/) to explore and generate OKLCH colors for your theme.
</Tip>

### Using Theme Variables

Once defined, reference your CSS variables directly as Tailwind utilities:

```tsx theme={null}
import { View, Text } from "react-native";

export const ThemedCard = () => (
  <View className="bg-card border border-border p-4 rounded-lg">
    <Text className="text-foreground text-lg font-bold">Card Title</Text>
    <Text className="text-foreground-secondary mt-2">
      This card automatically adapts to the current theme
    </Text>
  </View>
);
```

<Info>
  No need to use `var()` or brackets! Simply use the variable name without the `--color-` prefix. For example, `--color-primary` becomes `bg-primary` or `text-primary`.
</Info>

## Custom Themes

Define variables for custom themes beyond light and dark:

```css global.css theme={null}
@layer theme {
  :root {
    @variant dark {
      --color-background: #000000;
      --color-foreground: #ffffff;
    }

    @variant light {
      --color-background: #ffffff;
      --color-foreground: #000000;
    }

    /* Custom ocean theme */
    @variant ocean {
      --color-background: #0c4a6e;
      --color-foreground: #e0f2fe;
      --color-primary: #06b6d4;
      --color-accent: #67e8f9;
    }

    /* Custom sunset theme */
    @variant sunset {
      --color-background: #7c2d12;
      --color-foreground: #fef3c7;
      --color-primary: #f59e0b;
      --color-accent: #fb923c;
    }
  }
}
```

Learn more about custom themes in the [Custom Themes](/theming/custom-themes) guide.

## Static Theme Variables

If you need to define CSS variables that should always be available in JavaScript (via `useCSSVariable`) but aren't used in any `className`, use the `@theme static` directive:

```css global.css theme={null}
@import "tailwindcss";
@import "uniwind";

@theme static {
  /* Chart-specific values */
  --chart-line-width: 2;
  --chart-dot-radius: 4;
  --chart-grid-color: rgba(0, 0, 0, 0.1);

  /* Custom brand colors not used in classNames */
  --color-al-teal-10: #eaeeee;
  --color-al-teal-25: #cad4d5;
  --color-al-teal-75: #607d81;
  --color-al-teal-100: #2b5257;

  /* Native module configuration values */
  --map-zoom-level: 15;
  --animation-duration: 300;
}
```

### When to Use Static Variables

<Info>
  Variables defined in `@theme static` are always available via the [`useCSSVariable`](/api/use-css-variable) hook, even if they're never used in any `className`.
</Info>

Use `@theme static` for:

- **Third-party library configuration**: Values needed for chart libraries, maps, or other JavaScript APIs
- **Runtime calculations**: Design tokens used for JavaScript logic or animations
- **Native module values**: Configuration passed to native modules
- **JavaScript-only values**: Any CSS variable that should be accessible in JavaScript but doesn't need to generate Tailwind utilities

### Example: Using Static Variables

```tsx theme={null}
import { useCSSVariable } from "uniwind";
import { LineChart } from "react-native-chart-kit";

export const Chart = () => {
  const lineWidth = useCSSVariable("--chart-line-width");
  const dotRadius = useCSSVariable("--chart-dot-radius");
  const gridColor = useCSSVariable("--chart-grid-color");

  return (
    <LineChart
      data={data}
      chartConfig={{
        strokeWidth: lineWidth,
        dotRadius: dotRadius,
        color: () => gridColor,
      }}
    />
  );
};
```

<Tip>
  You can use any valid CSS in `global.css`. For more information, check the [CSS Parser](/api/css) documentation.
</Tip>

## Best Practices

<Tip>
  **Use semantic variable names:** Name variables based on their purpose (e.g., `--color-background`, `--color-primary`) rather than their value (e.g., `--color-blue-500`).
</Tip>

<Tip>
  **Keep theme variables consistent:** Ensure all themes define the same set of variables. If you miss a variable in one theme, we will warn you about it in `__DEV__` mode.
</Tip>

<Warning>
  **Avoid hard-coded colors in components:** Use CSS variables for colors that should adapt to themes. This ensures your UI remains consistent across theme changes.
</Warning>

## Related

<CardGroup cols={2}>
  <Card title="useCSSVariable" icon="code" href="/api/use-css-variable">
    Access CSS variable values in JavaScript
  </Card>

  <Card title="Theming Basics" icon="palette" href="/theming/basics">
    Learn the fundamentals of theming in Uniwind
  </Card>

  <Card title="Custom Themes" icon="swatchbook" href="/theming/custom-themes">
    Create and manage custom themes
  </Card>

  <Card title="CSS Parser" icon="code" href="/api/css">
    Learn about Uniwind's CSS parsing capabilities
  </Card>

  <Card title="Style Based on Themes" icon="paintbrush" href="/theming/style-based-on-themes">
    Advanced theme-based styling techniques
  </Card>
</CardGroup>
