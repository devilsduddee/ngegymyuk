import { supabase } from "@/lib/supabase";
import { WorkoutSession, WorkoutSet, CompleteSetInput } from "@/types/session";
import { generateUUID } from "@/utils/uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSIONS_STORAGE_KEY = "@ngegymyuk_workout_sessions";
const SETS_STORAGE_KEY_PREFIX = "@ngegymyuk_workout_sets_";

export const workoutSessionService = {
  async createSession(
    templateId: string | null,
    workoutName: string
  ): Promise<{ data: WorkoutSession | null; error: string | null }> {
    try {
      console.log("createSession: starting with templateId:", templateId, "workoutName:", workoutName);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const newId = generateUUID();
      const now = new Date().toISOString();

      const localSession: WorkoutSession = {
        id: newId,
        user_id: user?.id || "00000000-0000-0000-0000-000000000000",
        template_id: templateId,
        workout_name: workoutName.trim(),
        duration_seconds: 0,
        total_volume: 0,
        total_sets: 0,
        started_at: now,
        completed_at: null,
      };

      if (!user) {
        await this.addLocalSession(localSession);
        return { data: localSession, error: null };
      }

      const { data, error } = await supabase
        .from("workout_sessions")
        .insert([
          {
            user_id: user.id,
            template_id: templateId,
            workout_name: workoutName.trim(),
            duration_seconds: 0,
            total_volume: 0,
            total_sets: 0,
            started_at: now,
          },
        ])
        .select()
        .single();

      if (error) {
        console.warn("Supabase createSession error, falling back locally:", error.message);
        await this.addLocalSession(localSession);
        return { data: localSession, error: null };
      }

      const formatted: WorkoutSession = {
        id: data.id,
        user_id: data.user_id,
        template_id: data.template_id,
        workout_name: data.workout_name,
        duration_seconds: data.duration_seconds || 0,
        total_volume: Number(data.total_volume) || 0,
        total_sets: data.total_sets || 0,
        started_at: data.started_at,
        completed_at: data.completed_at,
      };

      await this.addLocalSession(formatted);
      console.log("createSession: success, session id:", formatted.id);
      return { data: formatted, error: null };
    } catch (err: any) {
      console.error("createSession catch error:", err);
      return { data: null, error: err.message || "Gagal membuat sesi latihan." };
    }
  },

  async logSet(
    input: CompleteSetInput
  ): Promise<{ data: WorkoutSet | null; error: string | null }> {
    try {
      const volume = Number((input.weight * input.reps).toFixed(2));
      const now = new Date().toISOString();
      const setId = generateUUID();

      const localSet: WorkoutSet = {
        id: setId,
        session_id: input.session_id,
        exercise_id: input.exercise_id,
        set_number: input.set_number,
        weight: input.weight,
        reps: input.reps,
        volume,
        created_at: now,
      };

      const { data, error } = await supabase
        .from("workout_sets")
        .insert([
          {
            session_id: input.session_id,
            exercise_id: input.exercise_id,
            set_number: input.set_number,
            weight: input.weight,
            reps: input.reps,
            volume,
          },
        ])
        .select()
        .single();

      if (error) {
        console.warn("Supabase logSet error, storing locally:", error.message);
        await this.addLocalSet(input.session_id, localSet);
        return { data: localSet, error: null };
      }

      const formatted: WorkoutSet = {
        id: data.id,
        session_id: data.session_id,
        exercise_id: data.exercise_id,
        set_number: data.set_number,
        weight: Number(data.weight) || 0,
        reps: data.reps || 0,
        volume: Number(data.volume) || 0,
        created_at: data.created_at,
      };

      await this.addLocalSet(input.session_id, formatted);
      return { data: formatted, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || "Gagal mencatat set latihan." };
    }
  },

  async completeSession(
    sessionId: string,
    durationSeconds: number,
    totalVolume: number,
    totalSets: number
  ): Promise<{ error: string | null }> {
    try {
      const completedAt = new Date().toISOString();
      const { error } = await supabase
        .from("workout_sessions")
        .update({
          duration_seconds: durationSeconds,
          total_volume: totalVolume,
          total_sets: totalSets,
          completed_at: completedAt,
        })
        .eq("id", sessionId);

      if (error) {
        console.warn("Supabase completeSession update error:", error.message);
      }

      // Update local storage representation
      const sessions = await this.getLocalSessions();
      const updated = sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              duration_seconds: durationSeconds,
              total_volume: totalVolume,
              total_sets: totalSets,
              completed_at: completedAt,
            }
          : s
      );
      await AsyncStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));

      return { error: null };
    } catch (err: any) {
      return { error: err.message || "Gagal menyelesaikan sesi latihan." };
    }
  },

  async discardSession(sessionId: string): Promise<{ error: string | null }> {
    try {
      await supabase.from("workout_sessions").delete().eq("id", sessionId);
      const sessions = await this.getLocalSessions();
      const filtered = sessions.filter((s) => s.id !== sessionId);
      await AsyncStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(filtered));
      await AsyncStorage.removeItem(`${SETS_STORAGE_KEY_PREFIX}${sessionId}`);
      return { error: null };
    } catch (err: any) {
      return { error: err.message || "Gagal membatalkan sesi." };
    }
  },

  // Storage Helpers
  async getLocalSessions(): Promise<WorkoutSession[]> {
    try {
      const raw = await AsyncStorage.getItem(SESSIONS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async addLocalSession(session: WorkoutSession): Promise<void> {
    const sessions = await this.getLocalSessions();
    const updated = [session, ...sessions.filter((s) => s.id !== session.id)];
    await AsyncStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
  },

  async getLocalSets(sessionId: string): Promise<WorkoutSet[]> {
    try {
      const raw = await AsyncStorage.getItem(`${SETS_STORAGE_KEY_PREFIX}${sessionId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async addLocalSet(sessionId: string, item: WorkoutSet): Promise<void> {
    const sets = await this.getLocalSets(sessionId);
    const updated = [...sets, item];
    await AsyncStorage.setItem(
      `${SETS_STORAGE_KEY_PREFIX}${sessionId}`,
      JSON.stringify(updated)
    );
  },

  // Get previous best weight recorded for a specific exercise
  async getExerciseBestWeight(exerciseId: string): Promise<number> {
    try {
      // 1. Check Supabase completed sets
      const { data, error } = await supabase
        .from("workout_sets")
        .select("weight")
        .eq("exercise_id", exerciseId)
        .order("weight", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        return Number(data[0].weight) || 0;
      }

      // 2. Fallback scan local storage sets (isolated by active user)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const rawSessions = await AsyncStorage.getItem(SESSIONS_STORAGE_KEY);
      const localSessions: any[] = rawSessions ? JSON.parse(rawSessions) : [];
      const userSessionIds = new Set(
        localSessions
          .filter((s) => {
            if (user) {
              return s.user_id === user.id;
            }
            return s.user_id === "local-user" || s.user_id === "00000000-0000-0000-0000-000000000000";
          })
          .map((s) => s.id)
      );

      let maxWeight = 0;

      for (const sessionId of userSessionIds) {
        const raw = await AsyncStorage.getItem(`${SETS_STORAGE_KEY_PREFIX}${sessionId}`);
        if (raw) {
          const sets: WorkoutSet[] = JSON.parse(raw);
          for (const s of sets) {
            if (s.exercise_id === exerciseId && s.weight > maxWeight) {
              maxWeight = s.weight;
            }
          }
        }
      }

      return maxWeight;
    } catch {
      return 0;
    }
  },
};
