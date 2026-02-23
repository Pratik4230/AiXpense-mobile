import { Pressable, Text, ActivityIndicator } from "react-native";
import { clsx } from "clsx";

type Variant = "default" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
}

const baseContainer = "items-center justify-center rounded-xl flex-row gap-2";
const baseText = "font-inter-semibold";

const variantContainer: Record<Variant, string> = {
  default: "bg-primary",
  outline: "border border-border bg-transparent",
  ghost: "bg-transparent",
  destructive: "bg-destructive",
};

const variantText: Record<Variant, string> = {
  default: "text-primary-foreground",
  outline: "text-foreground",
  ghost: "text-foreground",
  destructive: "text-destructive-foreground",
};

const sizeContainer: Record<Size, string> = {
  sm: "px-3 py-2",
  md: "px-4 py-3",
  lg: "px-6 py-4",
};

const sizeText: Record<Size, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

const spinnerColor: Record<Variant, string> = {
  default: "#ffffff",
  destructive: "#ffffff",
  outline: "#6366f1",
  ghost: "#6366f1",
};

export function Button({
  onPress,
  children,
  variant = "default",
  size = "md",
  loading = false,
  disabled = false,
  className,
  textClassName,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={clsx(
        baseContainer,
        variantContainer[variant],
        sizeContainer[size],
        isDisabled && "opacity-50",
        "active:opacity-70",
        className,
      )}
    >
      {loading && (
        <ActivityIndicator size="small" color={spinnerColor[variant]} />
      )}
      <Text
        className={clsx(
          baseText,
          variantText[variant],
          sizeText[size],
          textClassName,
        )}
      >
        {children}
      </Text>
    </Pressable>
  );
}
