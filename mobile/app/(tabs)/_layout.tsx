import { Tabs } from "expo-router";
import { useColorScheme } from "nativewind";
import { BarChart3, BriefcaseBusiness, Compass, Globe2, User } from "lucide-react-native";

const TAB_ICON_SIZE = 22;

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const tabBg     = isDark ? "#1c2c36" : "#ffffff";
  const tabBorder = isDark ? "rgba(255,255,255,0.09)" : "#d8eae3";
  const active    = isDark ? "#34d399" : "#0d9488";
  const inactive  = isDark ? "#7a9098" : "#617a72";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tabBg,
          borderTopColor: tabBorder,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: inactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <BarChart3 size={TAB_ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="portfolios"
        options={{
          title: "Portfolio",
          tabBarIcon: ({ color }) => <BriefcaseBusiness size={TAB_ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="markets"
        options={{
          title: "Markets",
          tabBarIcon: ({ color }) => <Globe2 size={TAB_ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color }) => <Compass size={TAB_ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => <User size={TAB_ICON_SIZE} color={color} />,
        }}
      />
    </Tabs>
  );
}
