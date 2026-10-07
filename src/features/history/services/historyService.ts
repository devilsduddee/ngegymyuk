import { supabase } from "@/lib/supabase";
import { WorkoutSession, WorkoutSet } from "@/types/session";
import {
  WorkoutHistoryDetail,
  WorkoutHistoryExerciseGroup,
} from "@/types/history";
import { initialExercises } from "@/features/exercises/data/initialExercises";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSIONS_STORAGE_KEY = "@ngegymyuk_workout_sessions";
const SETS_STORAGE_KEY_PREFIX = "@ngegymyuk_workout_sets_";

export const historyService = {
  // 1. Get all completed workout sessions for ACTIVE user (Newest first)
  async getCompletedSessions(): Promise<{
    data: WorkoutSession[];
    error: string | null;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const currentUserId = user?.id || null;

      // Remote query if authenticated - strictly filtered by user_id
      if (user) {
        const { data, error } = await supabase
          .from("workout_sessions")
          .select("*")
          .eq("user_id", user.id)
          .not("completed_at", "is", null)
          .order("completed_at", { ascending: false });

        if (!error && data) {
          const formatted: WorkoutSession[] = data.map((s: any) => ({
            id: s.id,
            user_id: s.user_id,
            template_id: s.template_id,
            workout_name: s.workout_name,
            duration_seconds: s.duration_seconds || 0,
            total_volume: Number(s.total_volume) || 0,
            total_sets: s.total_sets || 0,
            started_at: s.started_at,
            completed_at: s.completed_at,
          }));
          return { data: formatted, error: null };
        }
      }

      // Local storage fallback - STRICTLY filter by active user_id
      const raw = await AsyncStorage.getItem(SESSIONS_STORAGE_KEY);
      const local: WorkoutSession[] = raw ? JSON.parse(raw) : [];
      const completed = local
        .filter((s) => {
          if (!s.completed_at) return false;
          if (currentUserId) {
            return s.user_id === currentUserId;
          }
          return s.user_id === "local-user" || s.user_id === "00000000-0000-0000-0000-000000000000";
        })
        .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());

      return { data: completed, error: null };
    } catch (err: any) {
      return { data: [], error: err.message || "Gagal memuat riwayat latihan." };
    }
  },

  // 2. Get detailed workout session with grouped exercises and sets
  async getSessionDetail(
    sessionId: string
  ): Promise<{ data: WorkoutHistoryDetail | null; error: string | null }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const currentUserId = user?.id || null;

      // Fetch session header
      let session: WorkoutSession | null = null;

      let query = supabase
        .from("workout_sessions")
        .select("*")
        .eq("id", sessionId);

      if (currentUserId) {
        query = query.eq("user_id", currentUserId);
      }

      const { data: remoteSession } = await query.single();

      if (remoteSession) {
        session = {
          id: remoteSession.id,
          user_id: remoteSession.user_id,
          template_id: remoteSession.template_id,
          workout_name: remoteSession.workout_name,
          duration_seconds: remoteSession.duration_seconds || 0,
          total_volume: Number(remoteSession.total_volume) || 0,
          total_sets: remoteSession.total_sets || 0,
          started_at: remoteSession.started_at,
          completed_at: remoteSession.completed_at,
        };
      } else {
        const raw = await AsyncStorage.getItem(SESSIONS_STORAGE_KEY);
        const localList: WorkoutSession[] = raw ? JSON.parse(raw) : [];
        session =
          localList.find(
            (s) =>
              s.id === sessionId &&
              (!currentUserId || s.user_id === currentUserId)
          ) || null;
      }

      if (!session) {
        return { data: null, error: "Sesi latihan tidak ditemukan." };
      }

      // Fetch sets for this session
      let sets: WorkoutSet[] = [];

      const { data: remoteSets } = await supabase
        .from("workout_sets")
        .select(`
          id,
          session_id,
          exercise_id,
          set_number,
          weight,
          reps,
          volume,
          created_at,
          exercises (
            id,
            name,
            primary_muscle,
            secondary_muscle,
            equipment,
            description,
            image_url
          )
        `)
        .eq("session_id", sessionId)
        .order("set_number", { ascending: true });

      if (remoteSets && remoteSets.length > 0) {
        sets = remoteSets.map((rs: any) => ({
          id: rs.id,
          session_id: rs.session_id,
          exercise_id: rs.exercise_id,
          set_number: rs.set_number,
          weight: Number(rs.weight) || 0,
          reps: rs.reps || 0,
          volume: Number(rs.volume) || 0,
          created_at: rs.created_at,
          exercise: rs.exercises || initialExercises.find((e) => e.id === rs.exercise_id),
        }));
      } else {
        const rawSets = await AsyncStorage.getItem(`${SETS_STORAGE_KEY_PREFIX}${sessionId}`);
        const localSets: WorkoutSet[] = rawSets ? JSON.parse(rawSets) : [];
        sets = localSets.map((ls) => ({
          ...ls,
          exercise: ls.exercise || initialExercises.find((e) => e.id === ls.exercise_id),
        }));
      }

      // Group sets by exercise
      const groupsMap = new Map<string, WorkoutHistoryExerciseGroup>();

      for (const setItem of sets) {
        const exId = setItem.exercise_id;
        const exName = setItem.exercise?.name || "Exercise";
        const muscle = setItem.exercise?.primary_muscle || "General";

        if (!groupsMap.has(exId)) {
          groupsMap.set(exId, {
            exerciseId: exId,
            exerciseName: exName,
            primaryMuscle: muscle,
            sets: [],
            totalVolume: 0,
          });
        }

        const group = groupsMap.get(exId)!;
        group.sets.push(setItem);
        group.totalVolume = Number((group.totalVolume + setItem.volume).toFixed(2));
      }

      const detail: WorkoutHistoryDetail = {
        ...session,
        sets,
        exerciseGroups: Array.from(groupsMap.values()),
      };

      return { data: detail, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || "Gagal memuat detail sesi." };
    }
  },
};
