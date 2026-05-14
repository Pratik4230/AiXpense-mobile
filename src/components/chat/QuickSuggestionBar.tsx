import { View, Text, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { QUICK_SUGGESTIONS } from "@/constants/quickSuggestions";
import { useCurrency } from "@/hooks/useCurrency";

type Props = {
  onSuggestion: (s: string) => void;
  disabled?: boolean;
};

export function QuickSuggestionBar({ onSuggestion, disabled }: Props) {
  const { symbol } = useCurrency();

  return (
    <View
      className={
        disabled
          ? "bg-background px-3 pt-1 pb-1 opacity-50"
          : "bg-background px-3 pt-1 pb-1"
      }
    >
      <View className="flex-row flex-wrap gap-2 justify-center max-w-[400px] self-center">
        {QUICK_SUGGESTIONS.map((a) => {
          const withSymbol = a.label.replace(
            /\d[\d,]*/,
            (num) => `${symbol}${num}`,
          );
          return (
            <Pressable
              key={a.label}
              disabled={disabled}
              onPress={() => {
                void Haptics.selectionAsync();
                onSuggestion(withSymbol);
              }}
              className="flex-row items-center gap-2 rounded-2xl border border-separator bg-surface px-3.5 py-2.5 active:opacity-80"
            >
              <Text className="text-base">{a.icon}</Text>
              <Text className="text-[13px] font-medium text-foreground">
                {withSymbol}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
