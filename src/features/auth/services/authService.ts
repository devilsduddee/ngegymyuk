import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import {
  AuthResult,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
} from "@/types/auth";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export const mapSupabaseUser = (user: User): AuthUser => {
  return {
    id: user.id,
    email: user.email ?? "",
    displayName:
      user.user_metadata?.display_name ??
      user.user_metadata?.full_name ??
      user.email?.split("@")[0] ??
      null,
    avatarUrl: user.user_metadata?.avatar_url ?? null,
    createdAt: user.created_at,
  };
};

export const authService = {
  async loginWithEmail({
    email,
    password,
  }: LoginCredentials): Promise<AuthResult<AuthUser>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { data: null, error: error.message };
      }

      if (!data.user) {
        return { data: null, error: "Gagal memproses data pengguna." };
      }

      return { data: mapSupabaseUser(data.user), error: null };
    } catch (err: any) {
      return {
        data: null,
        error: err.message || "Terjadi kesalahan saat masuk.",
      };
    }
  },

  async registerWithEmail({
    email,
    password,
    displayName,
  }: RegisterCredentials): Promise<AuthResult<AuthUser>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        return { data: null, error: error.message };
      }

      if (!data.user) {
        return { data: null, error: "Pendaftaran berhasil tetapi data belum tersedia." };
      }

      return { data: mapSupabaseUser(data.user), error: null };
    } catch (err: any) {
      return {
        data: null,
        error: err.message || "Terjadi kesalahan saat pendaftaran.",
      };
    }
  },

  async signInWithGoogle(): Promise<AuthResult<void>> {
    try {
      // 1. Generate Redirect URI compatible with Expo Go, Standalone APK, and iOS Build
      const redirectUri = makeRedirectUri({
        scheme: "ngegymyuk",
        path: "auth/callback",
      });

      console.log("[Google OAuth] Generated redirectUri:", redirectUri);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: Platform.OS !== "web",
        },
      });

      if (error) {
        return { data: null, error: error.message };
      }

      if (Platform.OS !== "web" && data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri
        );

        // 2. Graceful Cancel Handling
        if (result.type === "cancel" || result.type === "dismiss") {
          return {
            data: null,
            error: "Login Google dibatalkan",
          };
        }

        if (result.type === "success" && result.url) {
          console.log("[Google OAuth] Callback received:", result.url);
          const parsedUrl = new URL(result.url);

          // Support both hash (implicit grant) and search (PKCE query params)
          const searchParams = parsedUrl.searchParams;
          const hashParams = new URLSearchParams(
            parsedUrl.hash ? parsedUrl.hash.substring(1) : ""
          );

          // Check PKCE code flow (?code=...)
          const code = searchParams.get("code") || hashParams.get("code");
          if (code) {
            console.log("[Google OAuth] Exchanging authorization code for session (PKCE)...");
            const { data: exchangeData, error: exchangeError } =
              await supabase.auth.exchangeCodeForSession(code);

            if (exchangeError) {
              console.error("[Google OAuth] exchangeCodeForSession failed:", exchangeError.message);
              return { data: null, error: exchangeError.message };
            }

            console.log("[EXCHANGE_CODE_SUCCESS]", exchangeData?.user?.email || "No user email");
            return { data: null, error: null };
          }

          // Check Implicit Access Token flow (#access_token=... or ?access_token=...)
          const accessToken =
            hashParams.get("access_token") || searchParams.get("access_token");
          const refreshToken =
            hashParams.get("refresh_token") || searchParams.get("refresh_token");

          if (accessToken && refreshToken) {
            console.log("[Google OAuth] Setting session via token pair...");
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              console.error("[Google OAuth] setSession failed:", sessionError.message);
              return { data: null, error: sessionError.message };
            }

            console.log("[SET_SESSION_SUCCESS]", sessionData?.user?.email || "No user email");
            return { data: null, error: null };
          }

          // Check if error is returned in query or hash params
          const authErrorDesc =
            searchParams.get("error_description") ||
            hashParams.get("error_description") ||
            searchParams.get("error") ||
            hashParams.get("error");

          if (authErrorDesc) {
            return { data: null, error: decodeURIComponent(authErrorDesc) };
          }
        }
      }

      return { data: null, error: null };
    } catch (err: any) {
      return {
        data: null,
        error: err.message || "Terjadi kesalahan saat login dengan Google.",
      };
    }
  },

  async signOut(): Promise<AuthResult<void>> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { data: null, error: error.message };
      }

      // Proactively clear in-memory stores to prevent cross-account leakage
      try {
        const { useHistoryStore } = await import("@/stores/historyStore");
        useHistoryStore.setState({
          sessions: [],
          activeDetail: null,
          prRecords: [],
          activeExerciseProgress: [],
          selectedExerciseName: null,
        });

        const { useAnalyticsStore } = await import("@/stores/analyticsStore");
        useAnalyticsStore.setState({
          summary: null,
        });

        const { useWorkoutStore } = await import("@/stores/workoutStore");
        useWorkoutStore.setState({
          templates: [],
          activeTemplate: null,
          activeExercises: [],
        });

        const { useActiveWorkoutStore } = await import("@/stores/activeWorkoutStore");
        useActiveWorkoutStore.getState().resetActiveWorkout();
      } catch (storeClearErr) {
        console.warn("Error clearing stores on logout:", storeClearErr);
      }

      return { data: null, error: null };
    } catch (err: any) {
      return {
        data: null,
        error: err.message || "Gagal keluar dari sesi.",
      };
    }
  },

  async getInitialSession() {
    try {
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch (err) {
      return null;
    }
  },
};
