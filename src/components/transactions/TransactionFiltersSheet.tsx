import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  useColorScheme,
} from "react-native";
import { BottomSheet, Button, Chip } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { CATEGORIES } from "@/constants/categories";
import type { TransactionFilters } from "@/services/transactions";

interface Props {
  filters: TransactionFilters;
  onApply: (f: TransactionFilters) => void;
  total: number;
}

const TYPES = [
  { label: "All", value: "all" },
  { label: "Expense", value: "expense" },
  { label: "Income", value: "income" },
];

const SORT_OPTIONS = [
  { label: "Date", value: "date" },
  { label: "Amount", value: "amount" },
  { label: "Category", value: "category" },
];

export function TransactionFiltersSheet({ filters, onApply, total }: Props) {
  const isDark = useColorScheme() === "dark";
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<TransactionFilters>({ ...filters });

  const handleOpen = useCallback(() => {
    setDraft({ ...filters });
    setIsOpen(true);
  }, [filters]);

  const toggleCategory = useCallback((cat: string) => {
    setDraft((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  }, []);

  const handleApply = useCallback(() => {
    onApply(draft);
    setIsOpen(false);
  }, [draft, onApply]);

  const handleClear = useCallback(() => {
    const cleared: TransactionFilters = {
      type: "all",
      categories: [],
      sort: "date",
      order: "desc",
    };
    setDraft(cleared);
    onApply(cleared);
    setIsOpen(false);
  }, [onApply]);

  const activeCount =
    (filters.type !== "all" ? 1 : 0) +
    (filters.categories.length > 0 ? 1 : 0) +
    (filters.sort !== "date" || filters.order !== "desc" ? 1 : 0);

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen}>
      <BottomSheet.Trigger asChild>
        <Pressable
          onPress={handleOpen}
          hitSlop={8}
          className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{
            backgroundColor:
              activeCount > 0
                ? isDark
                  ? "rgba(249,115,22,0.15)"
                  : "rgba(234,88,12,0.1)"
                : isDark
                  ? "#27272a"
                  : "#f4f4f5",
          }}
        >
          <Ionicons
            name="filter"
            size={14}
            color={
              activeCount > 0
                ? isDark
                  ? "#f97316"
                  : "#ea580c"
                : isDark
                  ? "#a1a1aa"
                  : "#71717a"
            }
          />
          <Text
            className="text-xs font-medium"
            style={{
              color:
                activeCount > 0
                  ? isDark
                    ? "#f97316"
                    : "#ea580c"
                  : isDark
                    ? "#a1a1aa"
                    : "#71717a",
            }}
          >
            Filters{activeCount > 0 ? ` (${activeCount})` : ""}
          </Text>
        </Pressable>
      </BottomSheet.Trigger>

      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content snapPoints={["70%"]}>
          <View className="px-5 pb-6">
            <View className="flex-row items-center justify-between mb-5">
              <BottomSheet.Title className="text-lg font-bold">
                Filters
              </BottomSheet.Title>
              <Pressable onPress={handleClear} hitSlop={8}>
                <Text
                  className="text-xs"
                  style={{ color: isDark ? "#f97316" : "#ea580c" }}
                >
                  Clear All
                </Text>
              </Pressable>
            </View>

            <Text
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: isDark ? "#71717a" : "#a1a1aa" }}
            >
              Type
            </Text>
            <View className="flex-row gap-2 mb-5">
              {TYPES.map((t) => (
                <Chip
                  key={t.value}
                  size="sm"
                  variant={draft.type === t.value ? "primary" : "secondary"}
                  color={draft.type === t.value ? "accent" : "default"}
                  onPress={() => setDraft((p) => ({ ...p, type: t.value }))}
                >
                  <Chip.Label>{t.label}</Chip.Label>
                </Chip>
              ))}
            </View>

            <Text
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: isDark ? "#71717a" : "#a1a1aa" }}
            >
              Categories
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-5"
              contentContainerClassName="gap-2 pb-1"
            >
              {CATEGORIES.map((cat) => (
                <Chip
                  key={cat}
                  size="sm"
                  variant={
                    draft.categories.includes(cat) ? "primary" : "secondary"
                  }
                  color={draft.categories.includes(cat) ? "accent" : "default"}
                  onPress={() => toggleCategory(cat)}
                >
                  <Chip.Label className="capitalize">{cat}</Chip.Label>
                </Chip>
              ))}
            </ScrollView>

            <Text
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: isDark ? "#71717a" : "#a1a1aa" }}
            >
              Sort By
            </Text>
            <View className="flex-row gap-2 mb-3">
              {SORT_OPTIONS.map((s) => (
                <Chip
                  key={s.value}
                  size="sm"
                  variant={draft.sort === s.value ? "primary" : "secondary"}
                  color={draft.sort === s.value ? "accent" : "default"}
                  onPress={() => setDraft((p) => ({ ...p, sort: s.value }))}
                >
                  <Chip.Label>{s.label}</Chip.Label>
                </Chip>
              ))}
            </View>
            <View className="flex-row gap-2 mb-6">
              <Chip
                size="sm"
                variant={draft.order === "desc" ? "primary" : "secondary"}
                color={draft.order === "desc" ? "accent" : "default"}
                onPress={() => setDraft((p) => ({ ...p, order: "desc" }))}
              >
                <Ionicons
                  name="arrow-down"
                  size={12}
                  color={
                    draft.order === "desc"
                      ? "#fff"
                      : isDark
                        ? "#a1a1aa"
                        : "#71717a"
                  }
                />
                <Chip.Label>Newest</Chip.Label>
              </Chip>
              <Chip
                size="sm"
                variant={draft.order === "asc" ? "primary" : "secondary"}
                color={draft.order === "asc" ? "accent" : "default"}
                onPress={() => setDraft((p) => ({ ...p, order: "asc" }))}
              >
                <Ionicons
                  name="arrow-up"
                  size={12}
                  color={
                    draft.order === "asc"
                      ? "#fff"
                      : isDark
                        ? "#a1a1aa"
                        : "#71717a"
                  }
                />
                <Chip.Label>Oldest</Chip.Label>
              </Chip>
            </View>

            <Button onPress={handleApply}>
              <Button.Label>Show {total} transactions</Button.Label>
            </Button>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
