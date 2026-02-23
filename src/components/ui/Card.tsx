import { View } from "react-native";
import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <View
      className={clsx(
        "bg-card rounded-2xl border border-border p-4",
        className,
      )}
    >
      {children}
    </View>
  );
}
