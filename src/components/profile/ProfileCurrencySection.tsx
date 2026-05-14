import { useState, useMemo, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import {
  BottomSheet,
  Button,
  Card,
  TextField,
  Input,
  Label,
  useThemeColor,
} from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useSession, authClient } from "@/lib/authClient";
import {
  CURRENCIES,
  getCurrency,
  type CurrencyCode,
} from "@/constants/currency";
import { resolveUserCurrencyCode } from "@/lib/userCurrency";

const SECTION_LABEL =
  "text-[11px] font-semibold text-muted uppercase tracking-[0.14em]";

export function ProfileCurrencySection() {
  const { data: session, refetch } = useSession();
  const user = session?.user as { currency?: string } | undefined;
  const currentCode = resolveUserCurrencyCode(user?.currency);
  const current = getCurrency(currentCode);

  const [accentColor] = useThemeColor(["accent"]);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CurrencyCode>(
    current.code as CurrencyCode,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sheetOpen) {
      setSelected(current.code as CurrencyCode);
      setQuery("");
      setError("");
    }
  }, [sheetOpen, current.code]);

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
    setSheetOpen(false);
  };

  return (
    <>
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
              onPress={() => setSheetOpen(true)}
              className="flex-row items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-accent/35 bg-accent/10 active:opacity-80"
            >
              <Text className="text-xs font-semibold text-accent">Change</Text>
              <Ionicons name="chevron-forward" size={14} color={accentColor} />
            </Pressable>
          </View>
        </Card.Body>
      </Card>

      <BottomSheet isOpen={sheetOpen} onOpenChange={setSheetOpen}>
        <BottomSheet.Portal>
          <BottomSheet.Overlay />
          <BottomSheet.Content snapPoints={["78%", "94%"]}>
            <BottomSheet.Title>Account currency</BottomSheet.Title>
            <Text className="text-sm text-muted leading-snug -mt-1 mb-3">
              Search by code or country. This matches the currency used on the
              web app.
            </Text>

            <TextField className="mb-3">
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
              <View className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 mb-2">
                <Text className="text-xs font-medium text-danger">{error}</Text>
              </View>
            ) : null}

            <BottomSheetScrollView
              style={{ maxHeight: 340, marginBottom: 16 }}
              contentContainerStyle={{ paddingRight: 4, paddingBottom: 4, gap: 4 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
            >
              {filtered.length === 0 ? (
                <Text className="text-sm text-muted py-6 text-center">
                  No currencies match your search.
                </Text>
              ) : (
                filtered.map((c) => {
                  const isSelected = c.code === selected;
                  return (
                    <Pressable
                      key={c.code}
                      onPress={() => setSelected(c.code)}
                      className={`flex-row items-center justify-between py-3 px-3 rounded-2xl border ${
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
                          <Text
                            className="text-xs text-muted mt-0.5"
                            numberOfLines={1}
                          >
                            {c.name}
                          </Text>
                        </View>
                      </View>
                      {isSelected ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={accentColor}
                        />
                      ) : null}
                    </Pressable>
                  );
                })
              )}
            </BottomSheetScrollView>

            <View className="flex-row gap-3">
              <Button
                variant="outline"
                onPress={() => setSheetOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onPress={handleSave}
                isDisabled={saving || !isDirty}
                className="flex-1"
              >
                {saving ? "Saving…" : "Save"}
              </Button>
            </View>
          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>
    </>
  );
}
