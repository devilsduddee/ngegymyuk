import { WorkoutSession, WorkoutSet } from "./session";
import { Exercise } from "./exercise";

export interface WorkoutHistoryDetail extends WorkoutSession {
  sets: WorkoutSet[];
  exerciseGroups: WorkoutHistoryExerciseGroup[];
}

export interface WorkoutHistoryExerciseGroup {
  exerciseId: string;
  exerciseName: string;
  primaryMuscle: string;
  sets: WorkoutSet[];
  totalVolume: number;
}

export interface ExercisePRRecord {
  exerciseId: string;
  exerciseName: string;
  primaryMuscle: string;
  weightPR: number; // Highest single weight lifted (kg)
  weightPRDate?: string;
  volumePR: number; // Highest single set volume (kg * reps)
  volumePRDate?: string;
  estimated1RM: number; // Max estimated 1RM using 1RM = Weight * (1 + Reps / 30)
  estimated1RMDate?: string;
}

export interface ExerciseProgressEntry {
  setId: string;
  date: string;
  workoutName: string;
  setNumber: number;
  weight: number;
  reps: number;
  volume: number;
  estimated1RM: number;
}
