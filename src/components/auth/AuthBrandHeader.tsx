import { View, Text } from "react-native";

type AuthBrandHeaderProps = {
  title: string;
  subtitle: string;
};

export function AuthBrandHeader({ title, subtitle }: AuthBrandHeaderProps) {
  return (
    <View className="mb-10">
      <Text className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent mb-3">
        AiXpense
      </Text>
      <Text className="text-[32px] font-bold text-foreground tracking-tight leading-tight mb-2.5">
        {title}
      </Text>
      <Text className="text-[15px] text-muted leading-snug">{subtitle}</Text>
    </View>
  );
}
