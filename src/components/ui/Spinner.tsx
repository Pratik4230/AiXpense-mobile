import { ActivityIndicator, View } from "react-native";
import { clsx } from "clsx";

interface SpinnerProps {
  size?: "small" | "large";
  color?: string;
  className?: string;
}

export function Spinner({ size = "small", color, className }: SpinnerProps) {
  return (
    <View className={clsx("items-center justify-center", className)}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}
