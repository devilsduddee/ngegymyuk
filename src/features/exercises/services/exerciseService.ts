import { supabase } from "@/lib/supabase";
import { Exercise, MuscleGroup, EquipmentType } from "@/types/exercise";
import { initialExercises } from "../data/initialExercises";

export const exerciseService = {
  async getAllExercises(): Promise<{ data: Exercise[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.warn("Menggunakan fallback local exercises:", error.message);
        return { data: initialExercises, error: null };
      }

      if (!data || data.length === 0) {
        return { data: initialExercises, error: null };
      }

      return { data: data as Exercise[], error: null };
    } catch (err: any) {
      console.warn("Exception saat fetch exercises, fallback ke local:", err?.message);
      return { data: initialExercises, error: null };
    }
  },

  filterExercises(
    exercises: Exercise[],
    query: string,
    muscle: MuscleGroup,
    equipment: EquipmentType
  ): Exercise[] {
    const sanitizedQuery = query.trim().toLowerCase();

    return exercises.filter((ex) => {
      // 1. Search Query Filter (name or description)
      const matchesQuery =
        sanitizedQuery === "" ||
        ex.name.toLowerCase().includes(sanitizedQuery) ||
        ex.description.toLowerCase().includes(sanitizedQuery);

      // 2. Muscle Group Filter
      const matchesMuscle =
        muscle === "All" ||
        ex.primary_muscle.toLowerCase() === muscle.toLowerCase() ||
        (ex.secondary_muscle &&
          ex.secondary_muscle.toLowerCase() === muscle.toLowerCase());

      // 3. Equipment Filter
      const matchesEquipment =
        equipment === "All" ||
        ex.equipment.toLowerCase() === equipment.toLowerCase();

      return matchesQuery && matchesMuscle && matchesEquipment;
    });
  },
};
