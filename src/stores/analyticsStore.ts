import { create } from "zustand";
import { AnalyticsSummary } from "@/types/analytics";
import { WorkoutSession } from "@/types/session";
import { analyticsService } from "@/features/analytics/services/analyticsService";

interface AnalyticsStoreState {
  summary: AnalyticsSummary | null;
  isLoading: boolean;
  error: string | null;

  fetchAnalytics: (providedSessions?: WorkoutSession[]) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsStoreState>((set) => ({
  summary: null,
  isLoading: false,
  error: null,

  fetchAnalytics: async (providedSessions?: WorkoutSession[]) => {
    set({ isLoading: true, error: null });
    try {
      const data = await analyticsService.getAnalyticsSummary(providedSessions);
      set({ summary: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Gagal memuat analitik.", isLoading: false });
    }
  },
}));
