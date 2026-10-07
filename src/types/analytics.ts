export interface DailyVolumeData {
  day: string; // "Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"
  value: number; // in kg
  label: string;
}

export interface MonthlyWorkoutData {
  month: string; // "Mei", "Jun", "Jul", "Ags", "Sep"
  value: number; // workout count
  label: string;
}

export interface MuscleDistributionItem {
  muscle: string;
  volume: number;
  percentage: number;
  color?: string;
}

export interface WeeklyInsight {
  volumeChangePercent: number | null; // e.g. +18 or -10, null if no past data
  volumeTrend: "up" | "down" | "same" | "neutral";
  mostFrequentWorkout: { name: string; count: number } | null;
  dominantMuscle: { name: string; percentage: number; volume: number } | null;
}

export interface AnalyticsSummary {
  totalWorkouts: number;
  totalVolume: number;
  totalDurationSeconds: number;
  weeklyVolume: number;
  weeklyDurationSeconds: number;
  weeklyWorkoutsCount: number;
  previousWeeklyVolume: number;
  weeklyInsight: WeeklyInsight;
  activeWeeklyDaysCount: number; // count of days in the last 7 days that have volume > 0
  activeMonthDataPoints: number; // count of months that have workout count > 0
  weeklyVolumeChart: DailyVolumeData[];
  monthlyWorkoutChart: MonthlyWorkoutData[];
  muscleDistribution: MuscleDistributionItem[];
}
