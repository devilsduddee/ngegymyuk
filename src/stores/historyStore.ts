import { create } from "zustand";
import { WorkoutSession } from "@/types/session";
import {
  WorkoutHistoryDetail,
  ExercisePRRecord,
  ExerciseProgressEntry,
} from "@/types/history";
import { historyService } from "@/features/history/services/historyService";
import { prService } from "@/features/history/services/prService";

interface HistoryStoreState {
  sessions: WorkoutSession[];
  activeDetail: WorkoutHistoryDetail | null;
  prRecords: ExercisePRRecord[];
  activeExerciseProgress: ExerciseProgressEntry[];
  selectedExerciseName: string | null;
  isLoading: boolean;
  error: string | null;

  fetchCompletedSessions: () => Promise<void>;
  fetchSessionDetail: (sessionId: string) => Promise<void>;
  fetchPRRecords: () => Promise<void>;
  fetchExerciseProgress: (exerciseId: string, exerciseName: string) => Promise<void>;
  clearDetail: () => void;
  clearExerciseProgress: () => void;
}

export const useHistoryStore = create<HistoryStoreState>((set) => ({
  sessions: [],
  activeDetail: null,
  prRecords: [],
  activeExerciseProgress: [],
  selectedExerciseName: null,
  isLoading: false,
  error: null,

  fetchCompletedSessions: async () => {
    set({ isLoading: true, error: null });
    const { data, error } = await historyService.getCompletedSessions();
    set({ sessions: data, isLoading: false, error });
  },

  fetchSessionDetail: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    const { data, error } = await historyService.getSessionDetail(sessionId);
    set({ activeDetail: data, isLoading: false, error });
  },

  fetchPRRecords: async () => {
    set({ isLoading: true, error: null });
    const records = await prService.getAllExercisePRs();
    set({ prRecords: records, isLoading: false });
  },

  fetchExerciseProgress: async (exerciseId: string, exerciseName: string) => {
    set({ isLoading: true, error: null, selectedExerciseName: exerciseName });
    const entries = await prService.getExerciseProgress(exerciseId);
    set({ activeExerciseProgress: entries, isLoading: false });
  },

  clearDetail: () => set({ activeDetail: null }),
  clearExerciseProgress: () =>
    set({ activeExerciseProgress: [], selectedExerciseName: null }),
}));
