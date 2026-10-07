export type MuscleGroup =
  | "All"
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Biceps"
  | "Triceps"
  | "Forearms"
  | "Abs"
  | "Quads"
  | "Hamstrings"
  | "Glutes"
  | "Calves";

export type EquipmentType =
  | "All"
  | "Barbell"
  | "Dumbbell"
  | "Machine"
  | "Cable"
  | "Bodyweight"
  | "Other";

export interface Exercise {
  id: string;
  name: string;
  primary_muscle: MuscleGroup;
  secondary_muscle: MuscleGroup | null;
  equipment: EquipmentType;
  description: string;
  image_url: string | null;
  created_at?: string;
}

export interface ExerciseFilterState {
  searchQuery: string;
  selectedMuscle: MuscleGroup;
  selectedEquipment: EquipmentType;
}
