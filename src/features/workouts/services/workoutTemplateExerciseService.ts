import { supabase } from "@/lib/supabase";
import {
  WorkoutTemplateExercise,
  AddTemplateExerciseInput,
  UpdateTemplateExerciseInput,
} from "@/types/workout";
import { initialExercises } from "@/features/exercises/data/initialExercises";
import { generateUUID } from "@/utils/uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCAL_EXERCISES_KEY_PREFIX = "@ngegymyuk_template_exercises_";

export const workoutTemplateExerciseService = {
  async getTemplateExercises(
    templateId: string
  ): Promise<{ data: WorkoutTemplateExercise[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("workout_template_exercises")
        .select(`
          id,
          template_id,
          exercise_id,
          order_number,
          target_sets,
          target_reps,
          rest_timer_seconds,
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
        .eq("template_id", templateId)
        .order("order_number", { ascending: true });

      if (error) {
        console.warn("Fetch exercises Supabase gagal, baca lokal:", error.message);
        return this.getLocalExercises(templateId);
      }

      const formatted: WorkoutTemplateExercise[] = (data || []).map((item: any) => ({
        id: item.id,
        template_id: item.template_id,
        exercise_id: item.exercise_id,
        order_number: item.order_number,
        target_sets: item.target_sets,
        target_reps: item.target_reps,
        rest_timer_seconds: item.rest_timer_seconds,
        created_at: item.created_at,
        exercise: item.exercises || this.findLocalExercise(item.exercise_id),
      }));

      await this.saveLocalExercises(templateId, formatted);
      return { data: formatted, error: null };
    } catch (err: any) {
      return this.getLocalExercises(templateId);
    }
  },

  async addExercise(
    input: AddTemplateExerciseInput,
    currentCount: number
  ): Promise<{ data: WorkoutTemplateExercise | null; error: string | null }> {
    try {
      const orderNumber = currentCount + 1;
      const targetSets = input.target_sets ?? 4;
      const targetReps = input.target_reps ?? 8;
      const restTimer = input.rest_timer_seconds ?? 90;
      const resolvedExercise = input.exercise || this.findLocalExercise(input.exercise_id);

      const localItem: WorkoutTemplateExercise = {
        id: generateUUID(),
        template_id: input.template_id,
        exercise_id: input.exercise_id,
        order_number: orderNumber,
        target_sets: targetSets,
        target_reps: targetReps,
        rest_timer_seconds: restTimer,
        created_at: new Date().toISOString(),
        exercise: resolvedExercise,
      };

      const { data, error } = await supabase
        .from("workout_template_exercises")
        .insert([
          {
            template_id: input.template_id,
            exercise_id: input.exercise_id,
            order_number: orderNumber,
            target_sets: targetSets,
            target_reps: targetReps,
            rest_timer_seconds: restTimer,
          },
        ])
        .select(`
          id,
          template_id,
          exercise_id,
          order_number,
          target_sets,
          target_reps,
          rest_timer_seconds,
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
        .single();

      if (error) {
        console.warn("Insert template exercise Supabase gagal, simpan lokal:", error.message);
        await this.addLocalExercise(input.template_id, localItem);
        return { data: localItem, error: null };
      }

      const result: WorkoutTemplateExercise = {
        id: data.id,
        template_id: data.template_id,
        exercise_id: data.exercise_id,
        order_number: data.order_number,
        target_sets: data.target_sets,
        target_reps: data.target_reps,
        rest_timer_seconds: data.rest_timer_seconds,
        created_at: data.created_at,
        exercise: (data as any).exercises || resolvedExercise,
      };

      await this.addLocalExercise(input.template_id, result);
      return { data: result, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || "Gagal menambahkan latihan ke template." };
    }
  },

  async updateExercise(
    templateId: string,
    exerciseId: string,
    input: UpdateTemplateExerciseInput
  ): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from("workout_template_exercises")
        .update(input)
        .eq("id", exerciseId);

      if (error) {
        console.warn("Update exercise Supabase gagal:", error.message);
      }

      const { data } = await this.getLocalExercises(templateId);
      const updated = data.map((item) => (item.id === exerciseId ? { ...item, ...input } : item));
      await this.saveLocalExercises(templateId, updated);
      return { error: null };
    } catch (err: any) {
      return { error: err.message || "Gagal memperbarui konfigurasi latihan." };
    }
  },

  async removeExercise(templateId: string, exerciseId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.from("workout_template_exercises").delete().eq("id", exerciseId);
      if (error) {
        console.warn("Delete exercise Supabase gagal:", error.message);
      }

      const { data } = await this.getLocalExercises(templateId);
      const remaining = data
        .filter((item) => item.id !== exerciseId)
        .map((item, idx) => ({ ...item, order_number: idx + 1 }));

      await this.saveLocalExercises(templateId, remaining);
      return { error: null };
    } catch (err: any) {
      return { error: err.message || "Gagal menghapus latihan dari template." };
    }
  },

  async reorderExercises(
    templateId: string,
    reordered: WorkoutTemplateExercise[]
  ): Promise<{ error: string | null }> {
    try {
      const updated = reordered.map((item, idx) => ({
        ...item,
        order_number: idx + 1,
      }));

      await this.saveLocalExercises(templateId, updated);

      // Async batch update to Supabase
      Promise.all(
        updated.map((item) =>
          supabase
            .from("workout_template_exercises")
            .update({ order_number: item.order_number })
            .eq("id", item.id)
        )
      ).catch((err) => {
        console.warn("Gagal update order Supabase:", err);
      });

      return { error: null };
    } catch (err: any) {
      return { error: err.message || "Gagal menyusun ulang latihan." };
    }
  },

  // Helper to find local exercise by id
  findLocalExercise(id: string) {
    if (!id) return undefined;
    return initialExercises.find(
      (e) => e.id.toLowerCase() === id.toLowerCase() || e.name.toLowerCase() === id.toLowerCase()
    );
  },

  async getLocalExercises(templateId: string): Promise<{ data: WorkoutTemplateExercise[]; error: string | null }> {
    try {
      const raw = await AsyncStorage.getItem(`${LOCAL_EXERCISES_KEY_PREFIX}${templateId}`);
      const data: WorkoutTemplateExercise[] = raw ? JSON.parse(raw) : [];
      const mapped = data.map((item) => ({
        ...item,
        exercise: item.exercise || this.findLocalExercise(item.exercise_id),
      }));
      return { data: mapped, error: null };
    } catch {
      return { data: [], error: null };
    }
  },

  async saveLocalExercises(templateId: string, exercises: WorkoutTemplateExercise[]): Promise<void> {
    try {
      await AsyncStorage.setItem(`${LOCAL_EXERCISES_KEY_PREFIX}${templateId}`, JSON.stringify(exercises));
    } catch {}
  },

  async addLocalExercise(templateId: string, item: WorkoutTemplateExercise): Promise<void> {
    const { data } = await this.getLocalExercises(templateId);
    const updated = [...data, item];
    await this.saveLocalExercises(templateId, updated);
  },
};
