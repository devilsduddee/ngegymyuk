import { supabase } from "@/lib/supabase";
import { WorkoutSet } from "@/types/session";
import { ExercisePRRecord, ExerciseProgressEntry } from "@/types/history";
import { initialExercises } from "@/features/exercises/data/initialExercises";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SETS_STORAGE_KEY_PREFIX = "@ngegymyuk_workout_sets_";
const SESSIONS_STORAGE_KEY = "@ngegymyuk_workout_sessions";

export const prService = {
  // 1. Calculate Estimated 1RM: 1RM = Weight * (1 + Reps / 30) capped at 15 reps
  calculateEstimated1RM(weight: number, reps: number): number {
    if (weight <= 0 || reps <= 0) return 0;
    if (reps === 1) return weight;
    const cappedReps = Math.min(reps, 15);
    return Number((weight * (1 + cappedReps / 30)).toFixed(1));
  },

  // 2. Fetch all sets across sessions (Supabase + User-Isolated Local fallback)
  async getAllSets(): Promise<(WorkoutSet & { workout_name?: string })[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const currentUserId = user?.id || "00000000-0000-0000-0000-000000000000";

      // Remote query if authenticated - strictly filtered by user_id
      if (user) {
        const { data, error } = await supabase
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
              primary_muscle
            ),
            workout_sessions!inner (
              workout_name,
              user_id
            )
          `)
          .eq("workout_sessions.user_id", user.id);

        if (!error && data && data.length > 0) {
          return data.map((rs: any) => ({
            id: rs.id,
            session_id: rs.session_id,
            exercise_id: rs.exercise_id,
            set_number: rs.set_number,
            weight: Number(rs.weight) || 0,
            reps: rs.reps || 0,
            volume: Number(rs.volume) || 0,
            created_at: rs.created_at,
            exercise: rs.exercises || initialExercises.find((e) => e.id === rs.exercise_id),
            workout_name: rs.workout_sessions?.workout_name || "Workout Session",
          }));
        }
      }

      // Local fallback with strict user isolation
      const rawSessions = await AsyncStorage.getItem(SESSIONS_STORAGE_KEY);
      const localSessions: any[] = rawSessions ? JSON.parse(rawSessions) : [];
      // Filter sessions belonging ONLY to active user
      const userSessionMap = new Map<string, string>();
      localSessions.forEach((s) => {
        if (user) {
          if (s.user_id === user.id) {
            userSessionMap.set(s.id, s.workout_name);
          }
        } else if (s.user_id === "local-user" || s.user_id === "00000000-0000-0000-0000-000000000000") {
          userSessionMap.set(s.id, s.workout_name);
        }
      });

      let allLocalSets: (WorkoutSet & { workout_name?: string })[] = [];

      for (const [sessionId, workoutName] of userSessionMap.entries()) {
        const raw = await AsyncStorage.getItem(`${SETS_STORAGE_KEY_PREFIX}${sessionId}`);
        if (raw) {
          const sets: WorkoutSet[] = JSON.parse(raw);
          const mapped = sets.map((s) => ({
            ...s,
            workout_name: workoutName,
            exercise: s.exercise || initialExercises.find((e) => e.id === s.exercise_id),
          }));
          allLocalSets = allLocalSets.concat(mapped);
        }
      }

      return allLocalSets;
    } catch {
      return [];
    }
  },

  // 3. Compute Personal Records (Weight PR, Volume PR, Estimated 1RM) per Exercise
  async getAllExercisePRs(): Promise<ExercisePRRecord[]> {
    const allSets = await this.getAllSets();
    const prMap = new Map<string, ExercisePRRecord>();

    for (const setItem of allSets) {
      const exId = setItem.exercise_id;
      const exName = setItem.exercise?.name || "Exercise";
      const muscle = setItem.exercise?.primary_muscle || "General";
      const e1RM = this.calculateEstimated1RM(setItem.weight, setItem.reps);

      if (!prMap.has(exId)) {
        prMap.set(exId, {
          exerciseId: exId,
          exerciseName: exName,
          primaryMuscle: muscle,
          weightPR: setItem.weight,
          weightPRDate: setItem.created_at,
          volumePR: setItem.volume,
          volumePRDate: setItem.created_at,
          estimated1RM: e1RM,
          estimated1RMDate: setItem.created_at,
        });
      } else {
        const record = prMap.get(exId)!;

        // Check Weight PR
        if (setItem.weight > record.weightPR) {
          record.weightPR = setItem.weight;
          record.weightPRDate = setItem.created_at;
        }

        // Check Volume PR
        if (setItem.volume > record.volumePR) {
          record.volumePR = setItem.volume;
          record.volumePRDate = setItem.created_at;
        }

        // Check 1RM PR
        if (e1RM > record.estimated1RM) {
          record.estimated1RM = e1RM;
          record.estimated1RMDate = setItem.created_at;
        }
      }
    }

    return Array.from(prMap.values()).sort((a, b) => b.weightPR - a.weightPR);
  },

  // 4. Get specific exercise chronological progress entries
  async getExerciseProgress(exerciseId: string): Promise<ExerciseProgressEntry[]> {
    const allSets = await this.getAllSets();
    const filtered = allSets.filter((s) => s.exercise_id === exerciseId);

    const entries: ExerciseProgressEntry[] = filtered.map((s) => ({
      setId: s.id,
      date: s.created_at,
      workoutName: s.workout_name || "Workout Session",
      setNumber: s.set_number,
      weight: s.weight,
      reps: s.reps,
      volume: s.volume,
      estimated1RM: this.calculateEstimated1RM(s.weight, s.reps),
    }));

    // Newest set first
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
};
