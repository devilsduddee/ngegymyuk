import React from "react";
import { Tabs } from "expo-router";
import { View, Text, Platform, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface CustomTabBarProps {
  state: any;
  navigation: any;
}

const CustomTabBar = React.memo(({ state, navigation }: CustomTabBarProps) => {
  const tabsMeta: Record<string, { label: string; icon: any; iconOutline: any }> = {
    home: { label: "Home", icon: "grid", iconOutline: "grid-outline" },
    workout: { label: "Workout", icon: "barbell", iconOutline: "barbell-outline" },
    history: { label: "History", icon: "calendar", iconOutline: "calendar-outline" },
    analytics: { label: "Analytics", icon: "stats-chart", iconOutline: "stats-chart-outline" },
    profile: { label: "Profile", icon: "person", iconOutline: "person-outline" },
  };

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        bottom: Platform.OS === "ios" ? 22 : 14,
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 99,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "rgba(23, 23, 23, 0.95)",
          borderRadius: 9999,
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.08)",
          paddingHorizontal: 8,
          paddingVertical: 6,
          height: 62,
          width: "92%",
          maxWidth: 400,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.7,
          shadowRadius: 24,
          elevation: 20,
        }}
      >
        {state.routes.map((route: any, index: number) => {
          const meta = tabsMeta[route.name];
          if (!meta) return null;

          const isFocused = state.index === index;

          const handlePress = () => {
            if (isFocused) return;
            
            // 1. Immediate navigation transition (eliminates delay on Android)
            navigation.navigate(route.name);

            // 2. Fire-and-forget haptics & emit event non-blocking
            try {
              Haptics.selectionAsync();
            } catch {}

            navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.8}
              onPress={handlePress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={meta.label}
              style={{
                flex: 1,
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 48,
                borderRadius: 9999,
                backgroundColor: isFocused ? "#C7FF41" : "transparent",
                paddingVertical: 4,
              }}
            >
              <Ionicons
                name={isFocused ? meta.icon : meta.iconOutline}
                size={20}
                color={isFocused ? "#080808" : "#A3A3A3"}
              />
              <Text
                numberOfLines={1}
                style={{
                  color: isFocused ? "#080808" : "#A3A3A3",
                  fontWeight: isFocused ? "700" : "500",
                  fontSize: 10,
                  marginTop: 2,
                  letterSpacing: -0.1,
                }}
              >
                {meta.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        freezeOnBlur: true,
        lazy: true,
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="workout" options={{ title: "Workout" }} />
      <Tabs.Screen name="history" options={{ title: "History" }} />
      <Tabs.Screen name="analytics" options={{ title: "Analytics" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen name="exercises" options={{ href: null }} />
    </Tabs>
  );
}
