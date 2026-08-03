import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { useRouter } from "expo-router";
import {
  Button,
  TextField,
  Input,
  Label,
  useThemeColor,
} from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession, authClient } from "@/lib/authClient";
import {
  CURRENCIES,
  getCurrency,
  type CurrencyCode,
} from "@/constants/currency";
import { resolveUserCurrencyCode } from "@/lib/userCurrency";

export default function CurrencyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: session, refetch } = useSession();
  const user = session?.user as { currency?: string } | undefined;
  const currentCode = resolveUserCurrencyCode(user?.currency);
  const [accentColor, mutedColor, backgroundColor] = useThemeColor([
    "accent",
    "muted",
    "background",
  ]);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CurrencyCode>(
    currentCode as CurrencyCode,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSelected(currentCode as CurrencyCode);
    setQuery("");
    setError("");
  }, [currentCode]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [...CURRENCIES];
    return CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q),
    );
  }, [query]);

  const isDirty = selected !== currentCode;

  const handleClose = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/profile");
  };

  const handleSave = async () => {
    setError("");
    setSaving(true);
    const meta = getCurrency(selected);
    const { error: updateError } = await authClient.updateUser({
      currency: meta.code,
      country: meta.country,
    } as { name?: string; currency?: string; country?: string });
    setSaving(false);
    if (updateError) {
      setError(updateError.message ?? "Could not update currency");
      return;
    }
    await refetch();
    handleClose();
  };

  return (
    <View className="flex-1" style={{ backgroundColor }}>
      <View className="px-5 pt-3 pb-3 border-b border-separator">
        <Text className="text-xl font-bold text-foreground">
          Account currency
        </Text>
        <Text className="text-sm text-muted leading-snug mt-1 mb-3">
          Search by code or country. Amounts and budgets use this currency.
        </Text>

        <TextField>
          <Label>Search</Label>
          <Input
            value={query}
            onChangeText={setQuery}
            placeholder="USD, euro, Japan…"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </TextField>

        {error ? (
          <View className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5 mt-3">
            <Text className="text-xs font-medium text-danger">{error}</Text>
          </View>
        ) : null}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.code}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 16,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
        ListEmptyComponent={
          <Text className="text-sm text-muted py-10 text-center">
            No currencies match your search.
          </Text>
        }
        renderItem={({ item: c }) => {
          const isSelected = c.code === selected;
          return (
            <Pressable
              onPress={() => setSelected(c.code)}
              className={`flex-row items-center justify-between py-3 px-3 mb-1 rounded-2xl border ${
                isSelected
                  ? "border-accent bg-accent/10"
                  : "border-separator bg-transparent"
              }`}
            >
              <View className="flex-row items-center gap-3 flex-1 min-w-0">
                <Text className="text-lg">{c.flag}</Text>
                <View className="flex-1 min-w-0">
                  <Text className="text-sm font-semibold text-foreground">
                    {c.code}
                  </Text>
                  <Text className="text-xs text-muted mt-0.5" numberOfLines={1}>
                    {c.name}
                  </Text>
                </View>
              </View>
              {isSelected ? (
                <Ionicons name="checkmark-circle" size={20} color={accentColor} />
              ) : (
                <Ionicons
                  name="ellipse-outline"
                  size={20}
                  color={mutedColor}
                />
              )}
            </Pressable>
          );
        }}
      />

      <View
        className="flex-row gap-3 px-5 pt-3 border-t border-separator"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <Button variant="outline" onPress={handleClose} className="flex-1">
          <Button.Label>Cancel</Button.Label>
        </Button>
        <Button
          onPress={handleSave}
          isDisabled={saving || !isDirty}
          className="flex-1"
        >
          <Button.Label>{saving ? "Saving…" : "Save"}</Button.Label>
        </Button>
      </View>
    </View>
  );
}
