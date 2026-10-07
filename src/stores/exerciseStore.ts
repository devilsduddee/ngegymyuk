import { create } from "zustand";
import { Exercise, MuscleGroup, EquipmentType } from "@/types/exercise";
import { exerciseService } from "@/features/exercises/services/exerciseService";

interface ExerciseStoreState {
  exercises: Exercise[];
  filteredExercises: Exercise[];
  searchQuery: string;
  selectedMuscle: MuscleGroup;
  selectedEquipment: EquipmentType;
  isLoading: boolean;
  error: string | null;

  fetchExercises: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedMuscle: (muscle: MuscleGroup) => void;
  setSelectedEquipment: (equipment: EquipmentType) => void;
  resetFilters: () => void;
}

export const useExerciseStore = create<ExerciseStoreState>((set, get) => ({
  exercises: [],
  filteredExercises: [],
  searchQuery: "",
  selectedMuscle: "All",
  selectedEquipment: "All",
  isLoading: false,
  error: null,

  fetchExercises: async () => {
    set({ isLoading: true, error: null });
    const { data, error } = await exerciseService.getAllExercises();

    const { searchQuery, selectedMuscle, selectedEquipment } = get();
    const filtered = exerciseService.filterExercises(
      data,
      searchQuery,
      selectedMuscle,
      selectedEquipment
    );

    set({
      exercises: data,
      filteredExercises: filtered,
      isLoading: false,
      error,
    });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    const { exercises, selectedMuscle, selectedEquipment } = get();
    const filtered = exerciseService.filterExercises(
      exercises,
      query,
      selectedMuscle,
      selectedEquipment
    );
    set({ filteredExercises: filtered });
  },

  setSelectedMuscle: (muscle: MuscleGroup) => {
    set({ selectedMuscle: muscle });
    const { exercises, searchQuery, selectedEquipment } = get();
    const filtered = exerciseService.filterExercises(
      exercises,
      searchQuery,
      muscle,
      selectedEquipment
    );
    set({ filteredExercises: filtered });
  },

  setSelectedEquipment: (equipment: EquipmentType) => {
    set({ selectedEquipment: equipment });
    const { exercises, searchQuery, selectedMuscle } = get();
    const filtered = exerciseService.filterExercises(
      exercises,
      searchQuery,
      selectedMuscle,
      equipment
    );
    set({ filteredExercises: filtered });
  },

  resetFilters: () => {
    const { exercises } = get();
    set({
      searchQuery: "",
      selectedMuscle: "All",
      selectedEquipment: "All",
      filteredExercises: exercises,
    });
  },
}));
