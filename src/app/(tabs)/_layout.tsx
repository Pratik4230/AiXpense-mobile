import { useEffect, type ReactNode } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { PressableProps, StyleProp, ViewStyle } from "react-native";
import {
  Pressable,
  View,
  StyleSheet,
  Platform,
  useColorScheme,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useThemeColor } from "heroui-native";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const SPRING_DOWN = { damping: 16, stiffness: 520, mass: 0.45 };
const SPRING_UP = { damping: 14, stiffness: 280, mass: 0.5 };

const TABS: {
  name: string;
  title: string;
  icon: IoniconName;
  iconFilled: IoniconName;
}[] = [
  {
    name: "index",
    title: "Chat",
    icon: "sparkles-outline",
    iconFilled: "sparkles",
  },
  {
    name: "budgets",
    title: "Budgets",
    icon: "wallet-outline",
    iconFilled: "wallet",
  },
  {
    name: "reports",
    title: "Reports",
    icon: "bar-chart-outline",
    iconFilled: "bar-chart",
  },
  {
    name: "profile",
    title: "Profile",
    icon: "person-outline",
    iconFilled: "person",
  },
];

type TabBarButtonProps = Omit<PressableProps, "children"> & {
  accentSoft: string;
  children: ReactNode;
};

function TabBarButton({
  children,
  onPress,
  onLongPress,
  accessibilityState,
  accentSoft,
  style,
  ...pressableRest
}: TabBarButtonProps) {
  const scale = useSharedValue(1);
  const focused = accessibilityState?.selected ?? false;
  const selected = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    selected.value = withSpring(focused ? 1 : 0, SPRING_UP);
  }, [focused, selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pillStyle = useAnimatedStyle(() => ({
    opacity: interpolate(selected.value, [0, 1], [0, 1]),
    transform: [{ scale: interpolate(selected.value, [0, 1], [0.85, 1]) }],
  }));

  const handlePress: NonNullable<PressableProps["onPress"]> = (e) => {
    void Haptics.selectionAsync();
    onPress?.(e);
  };

  return (
    <Pressable
      {...pressableRest}
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={() => {
        scale.value = withSpring(0.92, SPRING_DOWN);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, SPRING_UP);
      }}
      style={[styles.tabButton, style as StyleProp<ViewStyle>]}
      accessibilityRole="tab"
      accessibilityState={accessibilityState}
    >
      <View style={styles.tabButtonInner}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.activePill,
            { backgroundColor: accentSoft },
            pillStyle,
          ]}
        />
        <Animated.View style={[styles.iconWrap, animatedStyle]}>
          {children}
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonInner: {
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 44,
  },
  activePill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    marginHorizontal: 2,
    marginVertical: 4,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 40,
  },
});

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 10);
  const tabBarHeight = 52 + bottomPad;

  const [accentColor, mutedColor, backgroundColor, separatorColor] =
    useThemeColor(["accent", "muted", "background", "separator"]);

  const accentSoft = isDark ? "rgba(249, 115, 22, 0.16)" : "rgba(234, 88, 12, 0.12)";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: accentColor,
        tabBarInactiveTintColor: mutedColor,
        tabBarStyle: {
          backgroundColor: backgroundColor,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: separatorColor,
          height: tabBarHeight,
          paddingTop: 6,
          paddingBottom: bottomPad,
          paddingHorizontal: 4,
          elevation: 0,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: isDark ? 0.35 : 0.06,
              shadowRadius: 6,
            },
            default: {},
          }),
        },
        tabBarItemStyle: {
          paddingVertical: 0,
        },
        tabBarButton: (props) => (
          <TabBarButton {...props} accentSoft={accentSoft} />
        ),
      }}
    >
      {TABS.map(({ name, title, icon, iconFilled }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarAccessibilityLabel: title,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? iconFilled : icon}
                size={focused ? 25 : 24}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
