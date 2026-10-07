import { Exercise } from "./exercise";

export interface WorkoutTemplate {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  exercises?: WorkoutTemplateExercise[];
  exercise_count?: number;
}

export interface WorkoutTemplateExercise {
  id: string;
  template_id: string;
  exercise_id: string;
  order_number: number;
  target_sets: number;
  target_reps: number;
  rest_timer_seconds: number;
  created_at?: string;
  exercise?: Exercise;
}

export interface CreateTemplateInput {
  name: string;
}

export interface UpdateTemplateInput {
  name: string;
}

export interface AddTemplateExerciseInput {
  template_id: string;
  exercise_id: string;
  target_sets?: number;
  target_reps?: number;
  rest_timer_seconds?: number;
  exercise?: Exercise;
}

export interface UpdateTemplateExerciseInput {
  target_sets?: number;
  target_reps?: number;
  rest_timer_seconds?: number;
}
