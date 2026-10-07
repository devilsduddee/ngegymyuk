import { historyService } from "@/features/history/services/historyService";
import { prService } from "@/features/history/services/prService";
import { WorkoutSession } from "@/types/session";
import {
  AnalyticsSummary,
  DailyVolumeData,
  MonthlyWorkoutData,
  MuscleDistributionItem,
} from "@/types/analytics";

/**
 * Helper to get local date key in YYYY-MM-DD format based on device's local timezone.
 * Uses getFullYear(), getMonth(), getDate() instead of toISOString() to prevent
 * timezone shifts (e.g. WIB UTC+7 shifting late evening workouts to previous day).
 */
export function getLocalDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const analyticsService = {
  /**
   * Calculates comprehensive analytics summary.
   * Accepts optional pre-fetched sessions to avoid duplicate network queries.
   */
  async getAnalyticsSummary(
    providedSessions?: WorkoutSession[]
  ): Promise<AnalyticsSummary> {
    let sessions = providedSessions;
    if (!sessions) {
      const { data } = await historyService.getCompletedSessions();
      sessions = data;
    }

    const allSets = await prService.getAllSets();

    // 1. Total Lifetime Metrics
    const totalWorkouts = sessions.length;
    let totalVolume = 0;
    let totalDurationSeconds = 0;

    for (let i = 0; i < sessions.length; i++) {
      const s = sessions[i];
      totalVolume += s.total_volume || 0;
      totalDurationSeconds += s.duration_seconds || 0;
    }
    totalVolume = Number(totalVolume.toFixed(1));

    // 2. Setup date boundaries based on local device calendar
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(todayStart);
    startOfWeek.setDate(todayStart.getDate() - 6); // 7 days window (today - 6 to today)

    const startOfPrevWeek = new Date(todayStart);
    startOfPrevWeek.setDate(todayStart.getDate() - 13); // previous 7 days window (today - 13 to today - 7)

    // Pre-calculate target 7-day keys (oldest to newest)
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const targetDays: { dateKey: string; label: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setDate(todayStart.getDate() - i);
      targetDays.push({
        dateKey: getLocalDateKey(d),
        label: dayNames[d.getDay()],
      });
    }

    // Pre-calculate target 5-month keys (YYYY-M)
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Ags", "Sep", "Okt", "Nov", "Des",
    ];
    const targetMonths: { monthKey: string; label: string }[] = [];
    for (let m = 4; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
      targetMonths.push({
        monthKey: `${d.getFullYear()}-${d.getMonth()}`,
        label: monthNames[d.getMonth()],
      });
    }

    // 3. Single-Pass Session Indexing & Aggregation (O(N) instead of repeated O(N) filters)
    let weeklyVolume = 0;
    let weeklyDurationSeconds = 0;
    let weeklyWorkoutsCount = 0;
    let previousWeeklyVolume = 0;

    const dailyVolumeMap = new Map<string, number>();
    const monthlyCountMap = new Map<string, number>();
    const weeklyWorkoutNamesMap = new Map<string, number>();

    for (let i = 0; i < sessions.length; i++) {
      const s = sessions[i];
      const sessionDateStr = s.completed_at || s.started_at;
      if (!sessionDateStr) continue;

      const sessionDate = new Date(sessionDateStr);
      const sessionLocalKey = getLocalDateKey(sessionDate);
      const sessionMonthKey = `${sessionDate.getFullYear()}-${sessionDate.getMonth()}`;
      const sessionVol = s.total_volume || 0;
      const sessionDur = s.duration_seconds || 0;

      // Check if within last 7 local calendar days
      if (sessionDate >= startOfWeek) {
        weeklyVolume += sessionVol;
        weeklyDurationSeconds += sessionDur;
        weeklyWorkoutsCount += 1;

        const name = s.workout_name || "Workout";
        weeklyWorkoutNamesMap.set(name, (weeklyWorkoutNamesMap.get(name) || 0) + 1);
      } else if (sessionDate >= startOfPrevWeek) {
        // Within previous 7-day period
        previousWeeklyVolume += sessionVol;
      }

      // Aggregate daily volume
      const currentDayVol = dailyVolumeMap.get(sessionLocalKey) || 0;
      dailyVolumeMap.set(sessionLocalKey, currentDayVol + sessionVol);

      // Aggregate monthly count
      const currentMonthCount = monthlyCountMap.get(sessionMonthKey) || 0;
      monthlyCountMap.set(sessionMonthKey, currentMonthCount + 1);
    }

    weeklyVolume = Number(weeklyVolume.toFixed(1));
    previousWeeklyVolume = Number(previousWeeklyVolume.toFixed(1));

    // Build Weekly Chart Data (7 items guaranteed)
    let activeWeeklyDaysCount = 0;
    const weeklyVolumeChart: DailyVolumeData[] = targetDays.map((td) => {
      const vol = dailyVolumeMap.get(td.dateKey) || 0;
      if (vol > 0) activeWeeklyDaysCount += 1;
      return {
        day: td.label,
        label: td.label,
        value: vol > 0 ? Math.round(vol) : 0,
      };
    });

    // Build Monthly Chart Data (5 items guaranteed)
    let activeMonthDataPoints = 0;
    const monthlyWorkoutChart: MonthlyWorkoutData[] = targetMonths.map((tm) => {
      const count = monthlyCountMap.get(tm.monthKey) || 0;
      if (count > 0) activeMonthDataPoints += 1;
      return {
        month: tm.label,
        label: tm.label,
        value: count,
      };
    });

    // 4. Muscle Group Volume Distribution & Dominant Muscle
    const muscleMap = new Map<string, number>();
    let totalMuscleVolume = 0;

    for (let i = 0; i < allSets.length; i++) {
      const st = allSets[i];
      const muscle = st.exercise?.primary_muscle || "Other";
      const vol = st.volume || 0;
      if (vol > 0) {
        muscleMap.set(muscle, (muscleMap.get(muscle) || 0) + vol);
        totalMuscleVolume += vol;
      }
    }

    const muscleDistribution: MuscleDistributionItem[] = Array.from(
      muscleMap.entries()
    )
      .map(([muscle, volume]) => ({
        muscle,
        volume: Math.round(volume),
        percentage:
          totalMuscleVolume > 0
            ? Math.min(100, Math.max(0, Math.round((volume / totalMuscleVolume) * 100)))
            : 0,
      }))
      .sort((a, b) => b.volume - a.volume);

    // 5. Calculate Weekly Insight
    let volumeChangePercent: number | null = null;
    let volumeTrend: "up" | "down" | "same" | "neutral" = "neutral";

    if (previousWeeklyVolume > 0 && weeklyVolume > 0) {
      const diff = weeklyVolume - previousWeeklyVolume;
      const pct = Math.round((diff / previousWeeklyVolume) * 100);
      volumeChangePercent = pct;
      if (pct > 0) volumeTrend = "up";
      else if (pct < 0) volumeTrend = "down";
      else volumeTrend = "same";
    } else if (previousWeeklyVolume === 0 && weeklyVolume > 0) {
      volumeChangePercent = 100;
      volumeTrend = "up";
    } else if (previousWeeklyVolume > 0 && weeklyVolume === 0) {
      volumeChangePercent = -100;
      volumeTrend = "down";
    }

    // Most frequent workout this week
    let mostFrequentWorkout: { name: string; count: number } | null = null;
    let maxWorkoutCount = 0;
    for (const [name, count] of weeklyWorkoutNamesMap.entries()) {
      if (count > maxWorkoutCount) {
        maxWorkoutCount = count;
        mostFrequentWorkout = { name, count };
      }
    }

    // Dominant muscle
    const dominantMuscle =
      muscleDistribution.length > 0
        ? {
            name: muscleDistribution[0].muscle,
            percentage: muscleDistribution[0].percentage,
            volume: muscleDistribution[0].volume,
          }
        : null;

    return {
      totalWorkouts,
      totalVolume,
      totalDurationSeconds,
      weeklyVolume,
      weeklyDurationSeconds,
      weeklyWorkoutsCount,
      previousWeeklyVolume,
      activeWeeklyDaysCount,
      activeMonthDataPoints,
      weeklyInsight: {
        volumeChangePercent,
        volumeTrend,
        mostFrequentWorkout,
        dominantMuscle,
      },
      weeklyVolumeChart,
      monthlyWorkoutChart,
      muscleDistribution,
    };
  },
};
