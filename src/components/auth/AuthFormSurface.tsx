import type { ReactNode } from "react";
import { View } from "react-native";

/** Rounded surface for auth forms — reads as a native “sheet” */
export function AuthFormSurface({ children }: { children: ReactNode }) {
  return (
    <View className="rounded-[26px] border border-separator bg-surface overflow-hidden shadow-sm">
      <View className="p-5 gap-4">{children}</View>
    </View>
  );
}
