import { create } from "zustand";
import {
  WorkoutTemplate,
  WorkoutTemplateExercise,
  UpdateTemplateExerciseInput,
} from "@/types/workout";
import { Exercise } from "@/types/exercise";
import { workoutTemplateService } from "@/features/workouts/services/workoutTemplateService";
import { workoutTemplateExerciseService } from "@/features/workouts/services/workoutTemplateExerciseService";

interface WorkoutStoreState {
  templates: WorkoutTemplate[];
  activeTemplate: WorkoutTemplate | null;
  activeExercises: WorkoutTemplateExercise[];
  isLoading: boolean;
  error: string | null;

  fetchTemplates: () => Promise<void>;
  createTemplate: (name: string) => Promise<WorkoutTemplate | null>;
  updateTemplateName: (id: string, name: string) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;

  fetchTemplateDetail: (templateId: string) => Promise<void>;
  addExerciseToTemplate: (
    templateId: string,
    exerciseId: string,
    targetSets?: number,
    targetReps?: number,
    restTimerSeconds?: number,
    exercise?: import("@/types/exercise").Exercise
  ) => Promise<void>;
  updateExerciseConfig: (
    exerciseTemplateId: string,
    input: UpdateTemplateExerciseInput
  ) => Promise<void>;
  removeExerciseFromTemplate: (exerciseTemplateId: string) => Promise<void>;
  moveExercise: (currentIndex: number, direction: "up" | "down") => Promise<void>;
}

export const useWorkoutStore = create<WorkoutStoreState>((set, get) => ({
  templates: [],
  activeTemplate: null,
  activeExercises: [],
  isLoading: false,
  error: null,

  fetchTemplates: async () => {
    set({ isLoading: true, error: null });
    const { data, error } = await workoutTemplateService.getTemplates();
    set({ templates: data, isLoading: false, error });
  },

  createTemplate: async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      set({ error: "Nama template tidak boleh kosong." });
      return null;
    }
    set({ isLoading: true, error: null });
    const { data, error } = await workoutTemplateService.createTemplate(trimmed);
    if (data) {
      const current = get().templates;
      set({ templates: [data, ...current], isLoading: false });
      return data;
    }
    set({ isLoading: false, error });
    return null;
  },

  updateTemplateName: async (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const { templates, activeTemplate } = get();
    const updated = templates.map((t) => (t.id === id ? { ...t, name: trimmed } : t));
    set({
      templates: updated,
      activeTemplate: activeTemplate?.id === id ? { ...activeTemplate, name: trimmed } : activeTemplate,
    });
    await workoutTemplateService.updateTemplate(id, trimmed);
  },

  deleteTemplate: async (id: string) => {
    const { templates, activeTemplate } = get();
    const isCurrentActive = activeTemplate?.id === id;
    set({
      templates: templates.filter((t) => t.id !== id),
      activeTemplate: isCurrentActive ? null : activeTemplate,
      activeExercises: isCurrentActive ? [] : get().activeExercises,
    });
    await workoutTemplateService.deleteTemplate(id);
  },

  fetchTemplateDetail: async (templateId: string) => {
    set({ isLoading: true, error: null });
    const { templates } = get();
    const found = templates.find((t) => t.id === templateId) || null;
    const { data, error } = await workoutTemplateExerciseService.getTemplateExercises(templateId);

    set({
      activeTemplate: found,
      activeExercises: data,
      isLoading: false,
      error,
    });
  },

  addExerciseToTemplate: async (
    templateId: string,
    exerciseId: string,
    targetSets = 4,
    targetReps = 8,
    restTimerSeconds = 90,
    exercise?: Exercise
  ) => {
    const { activeExercises, templates } = get();
    const { data } = await workoutTemplateExerciseService.addExercise(
      {
        template_id: templateId,
        exercise_id: exerciseId,
        target_sets: targetSets,
        target_reps: targetReps,
        rest_timer_seconds: restTimerSeconds,
        exercise,
      },
      activeExercises.length
    );

    if (data) {
      // Ensure exercise object is present
      const exerciseWithObj = {
        ...data,
        exercise: data.exercise || exercise,
      };
      const updatedExercises = [...activeExercises, exerciseWithObj];
      const updatedTemplates = templates.map((t) =>
        t.id === templateId
          ? {
              ...t,
              exercises: updatedExercises,
              exercise_count: updatedExercises.length,
              updated_at: new Date().toISOString(),
            }
          : t
      );
      set({
        activeExercises: updatedExercises,
        activeTemplate:
          get().activeTemplate?.id === templateId
            ? {
                ...get().activeTemplate!,
                exercises: updatedExercises,
                exercise_count: updatedExercises.length,
                updated_at: new Date().toISOString(),
              }
            : get().activeTemplate,
        templates: updatedTemplates,
      });
    }
  },

  updateExerciseConfig: async (exerciseTemplateId: string, input: UpdateTemplateExerciseInput) => {
    const { activeTemplate, activeExercises, templates } = get();
    if (!activeTemplate) return;

    const updatedExercises = activeExercises.map((item) =>
      item.id === exerciseTemplateId ? { ...item, ...input } : item
    );

    const updatedTemplates = templates.map((t) =>
      t.id === activeTemplate.id
        ? {
            ...t,
            exercises: updatedExercises,
            exercise_count: updatedExercises.length,
            updated_at: new Date().toISOString(),
          }
        : t
    );

    set({
      activeExercises: updatedExercises,
      activeTemplate: {
        ...activeTemplate,
        exercises: updatedExercises,
        exercise_count: updatedExercises.length,
        updated_at: new Date().toISOString(),
      },
      templates: updatedTemplates,
    });

    await workoutTemplateExerciseService.updateExercise(activeTemplate.id, exerciseTemplateId, input);
  },

  removeExerciseFromTemplate: async (exerciseTemplateId: string) => {
    const { activeTemplate, activeExercises, templates } = get();
    if (!activeTemplate) return;

    const remaining = activeExercises
      .filter((item) => item.id !== exerciseTemplateId)
      .map((item, idx) => ({ ...item, order_number: idx + 1 }));

    const updatedTemplates = templates.map((t) =>
      t.id === activeTemplate.id
        ? {
            ...t,
            exercises: remaining,
            exercise_count: remaining.length,
            updated_at: new Date().toISOString(),
          }
        : t
    );

    set({
      activeExercises: remaining,
      activeTemplate: {
        ...activeTemplate,
        exercises: remaining,
        exercise_count: remaining.length,
        updated_at: new Date().toISOString(),
      },
      templates: updatedTemplates,
    });

    await workoutTemplateExerciseService.removeExercise(activeTemplate.id, exerciseTemplateId);
  },

  moveExercise: async (currentIndex: number, direction: "up" | "down") => {
    const { activeTemplate, activeExercises, templates } = get();
    if (!activeTemplate) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= activeExercises.length) return;

    const reordered = [...activeExercises];
    const [movedItem] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, movedItem);

    const withNewOrder = reordered.map((item, idx) => ({
      ...item,
      order_number: idx + 1,
    }));

    const updatedTemplates = templates.map((t) =>
      t.id === activeTemplate.id
        ? {
            ...t,
            exercises: withNewOrder,
            updated_at: new Date().toISOString(),
          }
        : t
    );

    set({
      activeExercises: withNewOrder,
      activeTemplate: {
        ...activeTemplate,
        exercises: withNewOrder,
        updated_at: new Date().toISOString(),
      },
      templates: updatedTemplates,
    });

    await workoutTemplateExerciseService.reorderExercises(activeTemplate.id, withNewOrder);
  },
}));
