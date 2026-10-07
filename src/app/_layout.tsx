import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/authStore";
import { mapSupabaseUser } from "@/features/auth/services/authService";
import { supabase } from "@/lib/supabase";
import "../global.css";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { session, isInitialized, setSession, setUser, setInitialized } =
    useAuthStore();

  useEffect(() => {
    // Single Source of Truth: Supabase onAuthStateChange automatically fires
    // INITIAL_SESSION on mount, followed by SIGNED_IN, SIGNED_OUT, and TOKEN_REFRESHED.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("[AUTH_EVENT]", event);
        console.log("[SESSION_USER]", currentSession?.user?.email || null);
        setSession(currentSession);
        if (currentSession?.user) {
          setUser(mapSupabaseUser(currentSession.user));
        } else {
          setUser(null);
        }
        setInitialized(true);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [setSession, setUser, setInitialized]);

  // 3. Navigation Guard
  useEffect(() => {
    console.log("[SESSION_STATE]", {
      isInitialized,
      hasSession: !!session,
      segments,
    });

    if (!isInitialized) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTestScreen = (segments as string[])[0] === "test-nativewind";
    const inCallbackScreen =
      (segments as string[])[0] === "auth" &&
      (segments as string[])[1] === "callback";

    if (inTestScreen || inCallbackScreen) {
      return;
    }

    if (!session && !inAuthGroup) {
      console.log("[NAV_GUARD] Redirecting unauthenticated user to login");
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      console.log("[NAV_GUARD] Redirecting authenticated user to home");
      router.replace("/(tabs)/home");
    }
  }, [session, isInitialized, segments, router]);

  if (!isInitialized) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#C7FF41" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#080808" },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/callback" />
        <Stack.Screen name="workout/[id]" />
        <Stack.Screen name="workout/active" />
        <Stack.Screen name="history/[id]" />
        <Stack.Screen name="history/progress" />
      </Stack>
    </SafeAreaProvider>
  );
}

