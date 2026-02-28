import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme, Pressable, View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const SPRING_DOWN = { damping: 15, stiffness: 450, mass: 0.5 };
const SPRING_UP = { damping: 12, stiffness: 200, mass: 0.5 };

const TABS: { name: string; icon: IoniconName; iconFilled: IoniconName }[] = [
  { name: "index", icon: "home-outline", iconFilled: "home" },
  { name: "budgets", icon: "wallet-outline", iconFilled: "wallet" },
  { name: "chat", icon: "sparkles-outline", iconFilled: "sparkles" },
  { name: "reports", icon: "bar-chart-outline", iconFilled: "bar-chart" },
  { name: "profile", icon: "person-outline", iconFilled: "person" },
];

function TabBarButton({
  children,
  onPress,
  onLongPress,
  accessibilityState,
  isDark,
}: {
  children: React.ReactNode;
  onPress?: (e: any) => void;
  onLongPress?: ((e: any) => void) | null;
  accessibilityState?: { selected?: boolean };
  isDark: boolean;
  [key: string]: any;
}) {
  const scale = useSharedValue(1);
  const focused = accessibilityState?.selected ?? false;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => {
        scale.value = withSpring(0.8, SPRING_DOWN);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, SPRING_UP);
      }}
      style={styles.tabButton}
    >
      <Animated.View style={[styles.tabButtonInner, animatedStyle]}>
        {focused && (
          <View
            style={[
              styles.activeDot,
              { backgroundColor: isDark ? "#f97316" : "#ea580c" },
            ]}
          />
        )}
        {children}
      </Animated.View>
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
    width: 48,
    height: 40,
  },
  activeDot: {
    position: "absolute",
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: isDark ? "#000000" : "#ffffff",
          borderTopWidth: 1,
          borderTopColor: isDark
            ? "rgba(249, 115, 22, 0.35)"
            : "rgba(234, 88, 12, 0.15)",
          elevation: 0,
          shadowOpacity: 0,
          height: 56,
          paddingTop: 8,
          paddingBottom: 28,
        },
        tabBarActiveTintColor: isDark ? "#f97316" : "#ea580c",
        tabBarInactiveTintColor: isDark ? "#52525b" : "#a1a1aa",
        tabBarButton: (props) => <TabBarButton {...props} isDark={isDark} />,
      }}
    >
      {TABS.map(({ name, icon, iconFilled }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? iconFilled : icon}
                size={26}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
