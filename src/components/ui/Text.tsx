import { Text as RNText } from "react-native";
import { clsx } from "clsx";

type Variant =
  | "heading"
  | "subheading"
  | "body"
  | "label"
  | "muted"
  | "caption";

interface TextProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  numberOfLines?: number;
}

const variantClass: Record<Variant, string> = {
  heading: "text-2xl font-inter-bold text-foreground",
  subheading: "text-lg font-inter-semibold text-foreground",
  body: "text-base font-inter text-foreground",
  label: "text-sm font-inter-medium text-foreground",
  muted: "text-sm font-inter text-muted-foreground",
  caption: "text-xs font-inter text-muted-foreground",
};

export function Text({
  children,
  variant = "body",
  className,
  numberOfLines,
}: TextProps) {
  return (
    <RNText
      numberOfLines={numberOfLines}
      className={clsx(variantClass[variant], className)}
    >
      {children}
    </RNText>
  );
}
