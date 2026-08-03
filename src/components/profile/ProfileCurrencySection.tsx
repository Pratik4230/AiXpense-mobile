import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Card, useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@/lib/authClient";
import { getCurrency } from "@/constants/currency";
import { resolveUserCurrencyCode } from "@/lib/userCurrency";

const SECTION_LABEL =
  "text-[11px] font-semibold text-muted uppercase tracking-[0.14em]";

/** Currency row on Profile — opens Expo Router formSheet `/currency` */
export function ProfileCurrencyCard() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as { currency?: string } | undefined;
  const current = getCurrency(resolveUserCurrencyCode(user?.currency));
  const [accentColor] = useThemeColor(["accent"]);

  return (
    <Card className="mb-4 rounded-3xl border border-separator overflow-hidden">
      <Card.Body className="gap-4 py-5">
        <Text className={SECTION_LABEL}>Currency</Text>
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1 min-w-0">
            <Text className="text-sm font-semibold text-foreground">
              {current.flag} {current.code}
            </Text>
            <Text
              className="text-xs text-muted mt-1 leading-snug"
              numberOfLines={2}
            >
              {current.name} · Amounts and budgets use this currency.
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/currency")}
            className="flex-row items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-accent/35 bg-accent/10 active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel="Change currency"
          >
            <Text className="text-xs font-semibold text-accent">Change</Text>
            <Ionicons name="chevron-forward" size={14} color={accentColor} />
          </Pressable>
        </View>
      </Card.Body>
    </Card>
  );
}
