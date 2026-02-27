import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const TABS: { name: string; icon: IoniconName; iconFilled: IoniconName }[] = [
  { name: "index", icon: "home-outline", iconFilled: "home" },
  { name: "budgets", icon: "wallet-outline", iconFilled: "wallet" },
  { name: "chat", icon: "sparkles-outline", iconFilled: "sparkles" },
  { name: "reports", icon: "bar-chart-outline", iconFilled: "bar-chart" },
  { name: "profile", icon: "person-outline", iconFilled: "person" },
];

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
