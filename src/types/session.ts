import { Exercise } from "./exercise";
import { WorkoutTemplateExercise } from "./workout";

export interface WorkoutSession {
  id: string;
  user_id: string;
  template_id?: string | null;
  workout_name: string;
  duration_seconds: number;
  total_volume: number;
  total_sets: number;
  started_at: string;
  completed_at?: string | null;
}

export interface WorkoutSet {
  id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  weight: number;
  reps: number;
  volume: number;
  created_at: string;
  exercise?: Exercise;
}

export interface CompleteSetInput {
  session_id: string;
  exercise_id: string;
  set_number: number;
  weight: number;
  reps: number;
}

export interface PRAchievement {
  exerciseId: string;
  exerciseName: string;
  previousWeight: number;
  newWeight: number;
}

export interface WorkoutSummary {
  durationSeconds: number;
  totalSets: number;
  totalVolume: number;
  newPRs?: PRAchievement[];
}
