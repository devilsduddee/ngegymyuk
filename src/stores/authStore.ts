import { create } from "zustand";
import { AuthState, AuthUser } from "@/types/auth";
import { Session } from "@supabase/supabase-js";

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: false,
  isInitialized: false,
  setSession: (session: Session | null) => set({ session }),
  setUser: (user: AuthUser | null) => set({ user }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setInitialized: (isInitialized: boolean) => set({ isInitialized }),
  reset: () =>
    set({
      session: null,
      user: null,
      isLoading: false,
    }),
}));
