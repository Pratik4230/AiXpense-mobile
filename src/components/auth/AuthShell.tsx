import type { ReactNode } from "react";
import {
  View,
  useColorScheme,
  StyleSheet,
  Pressable,
  Text,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "@/components/ui";

type AuthShellProps = {
  children: ReactNode;
  /** Vertically center content (login / signup) */
  centered?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  /** Extra padding on top when no back button */
  topPadding?: number;
};

export function AuthShell({
  children,
  centered = false,
  showBack = false,
  onBack,
  topPadding = 24,
}: AuthShellProps) {
  const isDark = useColorScheme() === "dark";
  const handleBack = onBack ?? (() => router.back());
  const muted = isDark ? "#a1a1aa" : "#525252";

  const scrollContent: ViewStyle = {
    flexGrow: 1,
    justifyContent: centered ? "center" : "flex-start",
    paddingHorizontal: 24,
    paddingTop: showBack ? 8 : topPadding,
    paddingBottom: 40,
  };

  return (
    <View className="flex-1">
      <StatusBar style={isDark ? "light" : "dark"} />
      <LinearGradient
        colors={
          isDark
            ? ["#08080a", "#0e0e12", "#0a0a0c"]
            : ["#ffffff", "#fafafa", "#f4f4f5"]
        }
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView className="flex-1 bg-transparent">
        <KeyboardAwareScrollView
          contentContainerStyle={scrollContent}
          keyboardShouldPersistTaps="handled"
          bottomOffset={16}
        >
          {showBack ? (
            <Pressable
              onPress={handleBack}
              hitSlop={12}
              className="flex-row items-center gap-0.5 self-start py-2 mb-4 active:opacity-65"
            >
              <Ionicons name="chevron-back" size={22} color={muted} />
              <Text className="text-base text-muted font-medium">Back</Text>
            </Pressable>
          ) : null}
          {children}
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
}
