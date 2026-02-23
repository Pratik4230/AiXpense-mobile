import { View } from "react-native";
import { clsx } from "clsx";

interface SeparatorProps {
  className?: string;
}

export function Separator({ className }: SeparatorProps) {
  return <View className={clsx("h-px bg-border w-full", className)} />;
}
