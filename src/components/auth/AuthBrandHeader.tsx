import { View, Text } from "react-native";

type AuthBrandHeaderProps = {
  title: string;
  subtitle: string;
  compact?: boolean;
};

export function AuthBrandHeader({
  title,
  subtitle,
  compact = false,
}: AuthBrandHeaderProps) {
  return (
    <View className={compact ? "mb-6" : "mb-10"}>
      <Text
        className={
          compact
            ? "text-[11px] font-semibold uppercase tracking-[0.22em] text-accent mb-2"
            : "text-[11px] font-semibold uppercase tracking-[0.22em] text-accent mb-3"
        }
      >
        AiXpense
      </Text>
      <Text
        className={
          compact
            ? "text-[28px] font-bold text-foreground tracking-tight leading-tight mb-2"
            : "text-[32px] font-bold text-foreground tracking-tight leading-tight mb-2.5"
        }
      >
        {title}
      </Text>
      <Text className="text-[15px] text-muted leading-snug">{subtitle}</Text>
    </View>
  );
}
