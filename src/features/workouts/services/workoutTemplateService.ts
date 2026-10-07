import { supabase } from "@/lib/supabase";
import { WorkoutTemplate, CreateTemplateInput, UpdateTemplateInput } from "@/types/workout";
import { generateUUID } from "@/utils/uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCAL_STORAGE_KEY = "@ngegymyuk_workout_templates";

export const workoutTemplateService = {
  // Fetch templates: Supabase first, fallback to AsyncStorage
  async getTemplates(): Promise<{ data: WorkoutTemplate[]; error: string | null }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return this.getLocalTemplates();
      }

      // Remote query if authenticated - strictly filtered by user_id
      if (user) {
        const { data, error } = await supabase
          .from("workout_templates")
          .select(`
            id,
            user_id,
            name,
            created_at,
            updated_at,
            workout_template_exercises (
              id
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!error && data) {
          const formatted: WorkoutTemplate[] = data.map((t: any) => ({
            id: t.id,
            user_id: t.user_id,
            name: t.name,
            created_at: t.created_at,
            updated_at: t.updated_at,
            exercise_count: t.workout_template_exercises?.length || 0,
          }));

          // Cache to local
          await this.saveLocalTemplates(formatted);
          return { data: formatted, error: null };
        }
      }

      // Local fallback with user isolation
      const { data: localList } = await this.getLocalTemplates();
      const filtered = localList.filter((t) => {
        if (user) {
          return t.user_id === user.id;
        }
        return t.user_id === "local-user" || t.user_id === "00000000-0000-0000-0000-000000000000";
      });

      return { data: filtered, error: null };
    } catch {
      return this.getLocalTemplates();
    }
  },

  async createTemplate(name: string): Promise<{ data: WorkoutTemplate | null; error: string | null }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const newId = generateUUID();
      const now = new Date().toISOString();

      if (!user) {
        const localTemplate: WorkoutTemplate = {
          id: newId,
          user_id: "00000000-0000-0000-0000-000000000000",
          name: name.trim(),
          created_at: now,
          updated_at: now,
          exercise_count: 0,
          exercises: [],
        };
        await this.addLocalTemplate(localTemplate);
        return { data: localTemplate, error: null };
      }

      const { data, error } = await supabase
        .from("workout_templates")
        .insert([{ user_id: user.id, name: name.trim() }])
        .select()
        .single();

      if (error) {
        // Fallback local creation if remote table does not exist yet
        console.warn("Insert ke Supabase gagal, simpan lokal:", error.message);
        const localTemplate: WorkoutTemplate = {
          id: newId,
          user_id: user.id,
          name: name.trim(),
          created_at: now,
          updated_at: now,
          exercise_count: 0,
          exercises: [],
        };
        await this.addLocalTemplate(localTemplate);
        return { data: localTemplate, error: null };
      }

      const formatted: WorkoutTemplate = {
        id: data.id,
        user_id: data.user_id,
        name: data.name,
        created_at: data.created_at,
        updated_at: data.updated_at,
        exercise_count: 0,
        exercises: [],
      };

      await this.addLocalTemplate(formatted);
      return { data: formatted, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || "Gagal membuat workout template." };
    }
  },

  async updateTemplate(id: string, name: string): Promise<{ error: string | null }> {
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("workout_templates")
        .update({ name: name.trim(), updated_at: now })
        .eq("id", id);

      if (error) {
        console.warn("Update Supabase gagal, update lokal:", error.message);
      }

      await this.updateLocalTemplateName(id, name.trim());
      return { error: null };
    } catch (err: any) {
      return { error: err.message || "Gagal mengubah nama template." };
    }
  },

  async deleteTemplate(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.from("workout_templates").delete().eq("id", id);
      if (error) {
        console.warn("Hapus template Supabase gagal, hapus lokal:", error.message);
      }
      await this.removeLocalTemplate(id);
      return { error: null };
    } catch (err: any) {
      return { error: err.message || "Gagal menghapus template." };
    }
  },

  // Local Storage Helpers for Offline & Graceful Resilience
  async getLocalTemplates(): Promise<{ data: WorkoutTemplate[]; error: string | null }> {
    try {
      const raw = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
      const data: WorkoutTemplate[] = raw ? JSON.parse(raw) : [];
      return { data, error: null };
    } catch (e) {
      return { data: [], error: null };
    }
  },

  async saveLocalTemplates(templates: WorkoutTemplate[]): Promise<void> {
    try {
      await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(templates));
    } catch (e) {}
  },

  async addLocalTemplate(template: WorkoutTemplate): Promise<void> {
    const { data } = await this.getLocalTemplates();
    const updated = [template, ...data.filter((t) => t.id !== template.id)];
    await this.saveLocalTemplates(updated);
  },

  async updateLocalTemplateName(id: string, name: string): Promise<void> {
    const { data } = await this.getLocalTemplates();
    const updated = data.map((t) => (t.id === id ? { ...t, name, updated_at: new Date().toISOString() } : t));
    await this.saveLocalTemplates(updated);
  },

  async removeLocalTemplate(id: string): Promise<void> {
    const { data } = await this.getLocalTemplates();
    const updated = data.filter((t) => t.id !== id);
    await this.saveLocalTemplates(updated);
  },
};
