import {
  View,
  Text,
  Pressable,
  ScrollView,
  useColorScheme,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "heroui-native";

const EXAMPLE_PROMPTS = [
  "Salary received 55000",
  "Coffee and almond croissant 320",
  "Paid rent 12000",
] as const;

const HIGHLIGHTS: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}[] = [
  {
    icon: "chatbubble-ellipses-outline",
    title: "Speak normally",
    subtitle: "No categories, formulas, or rigid forms.",
  },
  {
    icon: "scan-outline",
    title: "Paper to ledger",
    subtitle: "Point the camera at a bill; we extract the rest.",
  },
  {
    icon: "sparkles-outline",
    title: "Your money, clarified",
    subtitle: "Income, splits, and budgets stay in sync.",
  },
];

interface ChatEmptyStateProps {
  onSuggestionPress?: (suggestion: string) => void;
  disabled?: boolean;
}

export function ChatEmptyState({
  onSuggestionPress,
  disabled,
}: ChatEmptyStateProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const [accentColor, mutedColor] = useThemeColor(["accent", "muted"]);

  const orbPrimary = isDark
    ? ["rgba(249,115,22,0.16)", "rgba(249,115,22,0)"]
    : ["rgba(234,88,12,0.12)", "rgba(234,88,12,0)"];
  const orbSecondary = isDark
    ? ["rgba(250,250,250,0.06)", "rgba(250,250,250,0)"]
    : ["rgba(15,23,42,0.06)", "rgba(15,23,42,0)"];

  const cardBg = isDark ? "rgba(12,12,14,0.72)" : "rgba(255,255,255,0.78)";
  const cardBorder = isDark
    ? "rgba(255,255,255,0.08)"
    : "rgba(0,0,0,0.06)";
  const rowBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const pillBorder = isDark
    ? "rgba(255,255,255,0.1)"
    : "rgba(0,0,0,0.08)";
  const pillBg = isDark ? "rgba(22,22,26,0.9)" : "rgba(255,255,255,0.95)";
  const sampleMuted = isDark ? "rgba(161,161,170,0.95)" : "rgba(82,82,91,0.98)";

  const onTapExample = (text: string) => {
    if (disabled || !onSuggestionPress) return;
    void Haptics.selectionAsync();
    onSuggestionPress(text);
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.ambient}>
        <LinearGradient
          colors={orbPrimary}
          style={[styles.orb, styles.orbTop]}
          pointerEvents="none"
        />
        <LinearGradient
          colors={orbSecondary}
          style={[styles.orb, styles.orbBottom]}
          pointerEvents="none"
        />
      </View>

      <View style={styles.body}>
        <View style={styles.markRow}>
          <View
            style={[
              styles.markFrame,
              { borderColor: isDark ? "rgba(249,115,22,0.35)" : "rgba(234,88,12,0.28)" },
            ]}
          >
            <LinearGradient
              colors={
                isDark
                  ? ["rgba(249,115,22,0.28)", "rgba(249,115,22,0.05)"]
                  : ["rgba(234,88,12,0.18)", "rgba(234,88,12,0.04)"]
              }
              style={StyleSheet.absoluteFill}
            />
            <Text style={[styles.markGlyph, { color: accentColor }]}>✦</Text>
          </View>
          <View style={styles.markTextCol}>
            <Text
              style={[styles.eyebrow, { color: accentColor }]}
              numberOfLines={1}
            >
              AiXpense
            </Text>
            <Text style={[styles.tagline, { color: sampleMuted }]}>
              Private assistant
            </Text>
          </View>
        </View>

        <Text className="text-[28px] font-semibold text-foreground text-left leading-tight tracking-[-0.5px] mt-8">
          Your ledger,{"\n"}in plain words.
        </Text>

        <Text
          className="text-[15px] text-muted leading-relaxed mt-4 max-w-[320px]"
          style={{ lineHeight: 22 }}
        >
          One calm place to log what you earn and spend. Type it, say it, or
          scan it—we keep the structure behind the scenes.
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: cardBg,
              borderColor: cardBorder,
            },
          ]}
        >
          {HIGHLIGHTS.map((row, idx) => (
            <View
              key={row.title}
              style={[
                styles.cardRow,
                idx < HIGHLIGHTS.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: rowBorder,
                },
              ]}
            >
              <View style={[styles.rowIconWrap, { borderColor: pillBorder }]}>
                <Ionicons name={row.icon} size={22} color={accentColor} />
              </View>
              <View style={styles.rowCopy}>
                <Text className="text-[15px] font-semibold text-foreground">
                  {row.title}
                </Text>
                <Text
                  className="text-[13px] text-muted leading-snug mt-1"
                  style={{ color: mutedColor }}
                >
                  {row.subtitle}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {onSuggestionPress ? (
          <View style={styles.examplesBlock}>
            <Text
              style={[styles.examplesLabel, { color: sampleMuted }]}
              numberOfLines={1}
            >
              Try an example
            </Text>
            <View style={styles.examplesStack}>
              {EXAMPLE_PROMPTS.map((prompt) => (
                <Pressable
                  key={prompt}
                  accessibilityRole="button"
                  accessibilityLabel={`Use example: ${prompt}`}
                  disabled={disabled}
                  onPress={() => onTapExample(prompt)}
                  style={({ pressed }) => [
                    styles.pill,
                    {
                      borderColor: pillBorder,
                      backgroundColor: pillBg,
                      opacity: disabled ? 0.45 : pressed ? 0.92 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[styles.pillText, { color: sampleMuted }]}
                    numberOfLines={2}
                  >
                    “{prompt}”
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={accentColor}
                    style={styles.pillChevron}
                  />
                </Pressable>
              ))}
            </View>
            <Text className="text-[12px] text-muted mt-5 text-center opacity-80">
              Use the composer below when you&apos;re ready—this thread is saved
              automatically.
            </Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 4,
  },
  ambient: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  orb: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: 210,
  },
  orbTop: {
    top: -160,
    right: -120,
  },
  orbBottom: {
    bottom: -180,
    left: -140,
  },
  body: {
    position: "relative",
    zIndex: 1,
  },
  markRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  markFrame: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  markGlyph: {
    fontSize: 22,
    fontWeight: "200",
  },
  markTextCol: {
    flex: 1,
    justifyContent: "center",
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
  tagline: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 3,
    letterSpacing: 0.2,
  },
  card: {
    marginTop: 28,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  rowCopy: {
    flex: 1,
    paddingRight: 4,
  },
  examplesBlock: {
    marginTop: 32,
  },
  examplesLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  examplesStack: {
    gap: 10,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 12,
  },
  pillText: {
    flex: 1,
    fontSize: 15,
    fontStyle: "italic",
    fontWeight: "500",
    letterSpacing: 0.15,
    lineHeight: 21,
  },
  pillChevron: {
    opacity: 0.9,
  },
});
