import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColor } from "heroui-native";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
// ─── Tool groups ──────────────────────────────────────────────────────────────
// Each group maps to one or more backend AI tools so users can discover every
// capability at a glance.
const TOOL_GROUPS: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  examples: string[];
}[] = [
  {
    icon: "wallet-outline",
    label: "Add expense",
    examples: ["Coffee 120", "Paid rent 12,000", "Grocery bill 850 at DMart"],
  },
  {
    icon: "trending-up-outline",
    label: "Log income",
    examples: [
      "Salary received 55,000",
      "Freelance payment 8,000",
      "Got cashback 250",
    ],
  },
  {
    icon: "search-outline",
    label: "Search & insights",
    examples: [
      "How much did I spend on food this month?",
      "Show last 5 transactions",
      "Total income vs expenses",
    ],
  },
  {
    icon: "pie-chart-outline",
    label: "Budgets",
    examples: [
      "Set food budget to 5,000",
      "Show my budgets",
      "Delete my travel budget",
    ],
  },
  {
    icon: "camera-outline",
    label: "Scan a bill",
    examples: ["Scan this receipt", "Read the bill in the photo"],
  },
  {
    icon: "swap-horizontal-outline",
    label: "Edit or delete",
    examples: ["What currencies are supported?"],
  },
];

const SCAN_BILL_GROUP_LABEL = "Scan a bill";

interface ChatEmptyStateProps {
  onSuggestionPress?: (suggestion: string) => void;
  /** Opens camera / library flow (same as chat attach). Used for Scan a bill examples. */
  onScanBillPress?: (suggestion: string) => void;
  disabled?: boolean;
}

export function ChatEmptyState({
  onSuggestionPress,
  onScanBillPress,
  disabled,
}: ChatEmptyStateProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const [accentColor, mutedColor] = useThemeColor(["accent", "muted"]);

  const cardBg = isDark ? "rgba(18,18,22,0.85)" : "rgba(255,255,255,0.9)";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";

  const pillBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const sectionLabel = isDark ? "rgba(161,161,170,0.9)" : "rgba(82,82,91,0.9)";

  const onTap = (groupLabel: string, text: string) => {
    if (disabled) return;
    void Haptics.selectionAsync();
    if (groupLabel === SCAN_BILL_GROUP_LABEL && onScanBillPress) {
      onScanBillPress(text);
      return;
    }
    if (!onSuggestionPress) return;
    onSuggestionPress(text);
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <View
          style={[
            styles.badge,
            {
              borderColor: isDark
                ? "rgba(249,115,22,0.4)"
                : "rgba(234,88,12,0.3)",
            },
          ]}
        >
          <LinearGradient
            colors={
              isDark
                ? ["rgba(249,115,22,0.3)", "rgba(249,115,22,0.06)"]
                : ["rgba(234,88,12,0.2)", "rgba(234,88,12,0.04)"]
            }
            style={StyleSheet.absoluteFill}
          />
          <Text style={[styles.badgeGlyph, { color: accentColor }]}>✦</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.appName, { color: accentColor }]}>AiXpense</Text>
          <Text style={[styles.tagline, { color: mutedColor }]}>
            Your private finance assistant
          </Text>
        </View>
      </View>

      <Text className="text-[26px] font-semibold text-foreground leading-tight tracking-[-0.4px] mt-7">
        Hello! What can I help{"\n"}you with today?
      </Text>

      {/* ── Tool groups ── */}
      {onSuggestionPress || onScanBillPress ? (
        <View style={styles.groups}>
          {TOOL_GROUPS.map((group) => (
            <View key={group.label} style={styles.group}>
              {/* Group header */}
              <View style={styles.groupHeader}>
                <View
                  style={[styles.groupIconWrap, { borderColor: pillBorder }]}
                >
                  <Ionicons name={group.icon} size={16} color={accentColor} />
                </View>
                <Text style={[styles.groupLabel, { color: sectionLabel }]}>
                  {group.label}
                </Text>
              </View>

              {/* Example pills */}
              <View
                style={[
                  styles.card,
                  { backgroundColor: cardBg, borderColor: cardBorder },
                ]}
              >
                {group.examples.map((ex, idx) => (
                  <Pressable
                    key={ex}
                    accessibilityRole="button"
                    accessibilityLabel={`Try: ${ex}`}
                    disabled={disabled}
                    onPress={() => onTap(group.label, ex)}
                    style={({ pressed }) => [
                      styles.pill,
                      idx < group.examples.length - 1 && {
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: pillBorder,
                      },
                      {
                        opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.pillText, { color: sectionLabel }]}
                      numberOfLines={1}
                    >
                      {ex}
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={14}
                      color={accentColor}
                      style={{ opacity: 0.8 }}
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          ))}

          <Text
            className="text-[12px] text-muted text-center mt-2 mb-1 opacity-70"
            style={{ lineHeight: 18 }}
          >
            Tap any example or type your own below.
          </Text>
        </View>
      ) : (
        // Minimal state – no suggestion handler (e.g. read-only thread)
        <Text
          className="text-[14px] text-muted mt-4 leading-relaxed"
          style={{ lineHeight: 22 }}
        >
          Log expenses, income, set budgets, or ask anything about your finances
          — all in plain language.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  badgeGlyph: {
    fontSize: 20,
    fontWeight: "200",
  },
  appName: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
  tagline: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
    letterSpacing: 0.1,
  },
  groups: {
    marginTop: 24,
    gap: 20,
  },
  group: {
    gap: 8,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 2,
  },
  groupIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  card: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 10,
  },
  pillText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
});
