import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase";

/**
 * OAuth Callback Handler Screen.
 * Catches deep links directed to /auth/callback (from Google OAuth redirect)
 * and safely redirects the user to the home dashboard.
 */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    code?: string;
    error?: string;
    error_description?: string;
    "#"?: string;
    access_token?: string;
    refresh_token?: string;
  }>();
  const { session, isInitialized, setSession, setUser } = useAuthStore();

  useEffect(() => {
    console.log("[CALLBACK_SCREEN] Mounted with raw params:", params);
    console.log("[CALLBACK_SCREEN] Current session state:", {
      isInitialized,
      hasSession: !!session,
      userEmail: session?.user?.email || null,
    });

    let accessToken: string | null = params.access_token || null;
    let refreshToken: string | null = params.refresh_token || null;

    // Expo Router passes URL fragment (#access_token=...&refresh_token=...) as params["#"]
    if (params["#"]) {
      console.log("[CALLBACK_SCREEN] Parsing fragment from params['#']:", params["#"]);
      const hashParams = new URLSearchParams(params["#"]);
      accessToken = hashParams.get("access_token") || accessToken;
      refreshToken = hashParams.get("refresh_token") || refreshToken;
    }

    // 1. Handle Implicit Token Flow (params["#"] or query params)
    if (accessToken && refreshToken && !session) {
      console.log("[CALLBACK_SCREEN] Tokens found! Invoking supabase.auth.setSession...");
      supabase.auth
        .setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        .then(({ data, error }) => {
          if (error) {
            console.error("[CALLBACK_SCREEN] setSession failed:", error.message);
            router.replace("/(auth)/login");
          } else if (data.session) {
            console.log("[CALLBACK_SCREEN] setSession SUCCESS:", data.session.user?.email);
            setSession(data.session);
            setUser({
              id: data.session.user.id,
              email: data.session.user.email ?? "",
              displayName:
                data.session.user.user_metadata?.display_name ??
                data.session.user.user_metadata?.full_name ??
                data.session.user.email?.split("@")[0] ??
                null,
              avatarUrl: data.session.user.user_metadata?.avatar_url ?? null,
              createdAt: data.session.user.created_at,
            });
            router.replace("/(tabs)/home");
          } else {
            console.warn("[CALLBACK_SCREEN] setSession completed but no session data returned");
            router.replace("/(auth)/login");
          }
        })
        .catch((err) => {
          console.error("[CALLBACK_SCREEN] setSession exception:", err);
          router.replace("/(auth)/login");
        });
      return;
    }

    // 2. Handle PKCE code flow (params.code)
    if (params.code && !session) {
      console.log("[CALLBACK_SCREEN] Exchanging code directly from route params...");
      supabase.auth.exchangeCodeForSession(params.code).then(({ data, error }) => {
        if (error) {
          console.error("[CALLBACK_SCREEN] exchangeCode error:", error.message);
          router.replace("/(auth)/login");
        } else if (data.session) {
          console.log("[CALLBACK_SCREEN] exchangeCode success:", data.user?.email);
          setSession(data.session);
          router.replace("/(tabs)/home");
        } else {
          router.replace("/(auth)/login");
        }
      });
      return;
    }

    if (!isInitialized) return;

    if (session) {
      console.log("[CALLBACK_SCREEN] Session active, navigating to /(tabs)/home");
      router.replace("/(tabs)/home");
    } else {
      // Debounce check to give async events a moment to settle
      const timer = setTimeout(() => {
        const latestSession = useAuthStore.getState().session;
        console.log("[CALLBACK_SCREEN] Debounced check:", { hasSession: !!latestSession });
        if (latestSession) {
          router.replace("/(tabs)/home");
        } else {
          console.log("[CALLBACK_SCREEN] No session found, redirecting to login");
          router.replace("/(auth)/login");
        }
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [session, isInitialized, params, router, setSession, setUser]);

  return (
    <View className="flex-1 bg-background justify-center items-center">
      <ActivityIndicator size="large" color="#C7FF41" />
    </View>
  );
}
