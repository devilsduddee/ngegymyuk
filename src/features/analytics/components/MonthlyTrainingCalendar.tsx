import React, { useState, useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { WorkoutSession } from "@/types/session";
import { getLocalDateKey } from "@/features/analytics/services/analyticsService";

interface MonthlyTrainingCalendarProps {
  sessions: WorkoutSession[];
}

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const WEEKDAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export const MonthlyTrainingCalendar: React.FC<MonthlyTrainingCalendarProps> = ({
  sessions,
}) => {
  // 0 = current month, -1 = previous month, +1 = next month, etc.
  const [monthOffset, setMonthOffset] = useState(0);

  const handlePrevMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMonthOffset((prev) => prev - 1);
  };

  const handleNextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMonthOffset((prev) => prev + 1);
  };

  const handleResetCurrentMonth = () => {
    if (monthOffset !== 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setMonthOffset(0);
    }
  };

  const calendarData = useMemo(() => {
    const realNow = new Date();
    const realYear = realNow.getFullYear();
    const realMonth = realNow.getMonth();
    const realTodayDate = realNow.getDate();

    // The target month being displayed
    const viewingDate = new Date(realYear, realMonth + monthOffset, 1);
    const viewYear = viewingDate.getFullYear();
    const viewMonth = viewingDate.getMonth();
    const isCurrentMonthView = monthOffset === 0;

    // 1. Set of all active dates in local format YYYY-MM-DD
    const activeDatesSet = new Set<string>();
    let monthWorkoutsCount = 0;

    for (let i = 0; i < sessions.length; i++) {
      const s = sessions[i];
      const rawDate = s.completed_at || s.started_at;
      if (!rawDate) continue;

      const d = new Date(rawDate);
      const dateKey = getLocalDateKey(d);
      activeDatesSet.add(dateKey);

      if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
        monthWorkoutsCount++;
      }
    }

    // 2. Current Streak Calculation (consecutive training days ending today or yesterday)
    let currentStreak = 0;
    const checkDate = new Date(realYear, realMonth, realTodayDate);

    if (activeDatesSet.has(getLocalDateKey(checkDate))) {
      while (activeDatesSet.has(getLocalDateKey(checkDate))) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
      while (activeDatesSet.has(getLocalDateKey(checkDate))) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    // 3. Month Grid Details
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // Monday as start (0 = Mon, ..., 6 = Sun)
    const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

    const days: Array<{
      dayNumber: number;
      isCurrentMonth: boolean;
      hasWorkout: boolean;
      isToday: boolean;
      isPast: boolean;
      isFuture: boolean;
    }> = [];

    // Empty lead slots before the 1st day of the month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({
        dayNumber: 0,
        isCurrentMonth: false,
        hasWorkout: false,
        isToday: false,
        isPast: false,
        isFuture: false,
      });
    }

    // Days of viewing month
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(viewYear, viewMonth, day);
      const dayKey = getLocalDateKey(d);
      const hasWorkout = activeDatesSet.has(dayKey);

      const isToday =
        isCurrentMonthView && day === realTodayDate;

      // When viewing past month, all days are past; when viewing future month, all days are future
      const isPast =
        viewYear < realYear ||
        (viewYear === realYear && viewMonth < realMonth) ||
        (isCurrentMonthView && day < realTodayDate);

      const isFuture =
        viewYear > realYear ||
        (viewYear === realYear && viewMonth > realMonth) ||
        (isCurrentMonthView && day > realTodayDate);

      days.push({
        dayNumber: day,
        isCurrentMonth: true,
        hasWorkout,
        isToday,
        isPast,
        isFuture,
      });
    }

    // Trailing empty slots to complete the final week row (so flex-wrap aligns to 7 columns)
    const totalSlots = days.length;
    const remainingSlots = (7 - (totalSlots % 7)) % 7;
    for (let i = 0; i < remainingSlots; i++) {
      days.push({
        dayNumber: 0,
        isCurrentMonth: false,
        hasWorkout: false,
        isToday: false,
        isPast: false,
        isFuture: false,
      });
    }

    return {
      monthLabel: `${MONTH_NAMES[viewMonth]} ${viewYear}`,
      streak: currentStreak,
      monthWorkoutsCount,
      days,
      isCurrentMonthView,
    };
  }, [sessions, monthOffset]);

  return (
    <View className="bg-[#121212] border border-white/[0.08] rounded-3xl p-5">
      {/* Header: Title + Navigation + Streak Pill & Count */}
      <View className="flex-row items-center justify-between mb-4">
        {/* Month Title & Fast Nav */}
        <View className="flex-row items-center gap-2">
          <View>
            <Text className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Konsistensi Latihan
            </Text>
            <Pressable
              onPress={handleResetCurrentMonth}
              disabled={calendarData.isCurrentMonthView}
              className="flex-row items-center mt-0.5 active:opacity-70"
            >
              <Text className="text-base font-black text-white tracking-tight">
                {calendarData.monthLabel}
              </Text>
              {!calendarData.isCurrentMonthView && (
                <View className="ml-1.5 px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                  <Text className="text-[10px] font-bold text-primary">Hari Ini</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* Month Arrows & Badges */}
        <View className="flex-row items-center gap-2">
          {/* Streak Badge */}
          <View className="flex-row items-center bg-primary/10 border border-primary/25 px-2.5 py-1.5 rounded-full">
            <Ionicons name="flame" size={13} color="#C7FF41" />
            <Text className="text-xs font-black text-primary ml-1">
              {calendarData.streak} Hari
            </Text>
          </View>

          {/* Month Step Navigation Arrows */}
          <View className="flex-row items-center bg-white/[0.04] border border-white/[0.08] rounded-full p-0.5">
            <Pressable
              onPress={handlePrevMonth}
              className="w-7 h-7 rounded-full items-center justify-center active:bg-white/[0.1]"
              accessibilityLabel="Bulan sebelumnya"
            >
              <Ionicons name="chevron-back" size={15} color="#FFFFFF" />
            </Pressable>
            <View className="w-[1px] h-3 bg-white/[0.1]" />
            <Pressable
              onPress={handleNextMonth}
              className="w-7 h-7 rounded-full items-center justify-center active:bg-white/[0.1]"
              accessibilityLabel="Bulan berikutnya"
            >
              <Ionicons name="chevron-forward" size={15} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Weekday Row (Mon - Sun) */}
      <View className="flex-row justify-between mb-2.5">
        {WEEKDAY_LABELS.map((dayLabel, idx) => (
          <View key={idx} className="w-[13%] items-center justify-center">
            <Text className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              {dayLabel}
            </Text>
          </View>
        ))}
      </View>

      {/* Monthly Days Grid */}
      <View className="flex-row flex-wrap justify-between">
        {calendarData.days.map((item, index) => {
          if (!item.isCurrentMonth) {
            return (
              <View
                key={`empty-${index}`}
                className="w-[13%] aspect-square items-center justify-center my-1"
              />
            );
          }

          // 1. Active Workout Day: Performance Lime accent background with bold dark text
          if (item.hasWorkout) {
            return (
              <View
                key={`day-${item.dayNumber}`}
                className="w-[13%] aspect-square rounded-xl bg-primary items-center justify-center my-1 shadow-sm"
              >
                <Text className="text-xs font-black text-black">
                  {item.dayNumber}
                </Text>
              </View>
            );
          }

          // 2. Today (no workout completed yet): prominent lime border indicator
          if (item.isToday) {
            return (
              <View
                key={`day-${item.dayNumber}`}
                className="w-[13%] aspect-square rounded-xl bg-white/[0.04] border-2 border-primary items-center justify-center my-1"
              >
                <Text className="text-xs font-black text-white">
                  {item.dayNumber}
                </Text>
              </View>
            );
          }

          // 3. Past Day without workout: subtle muted inactive rest day style
          if (item.isPast) {
            return (
              <View
                key={`day-${item.dayNumber}`}
                className="w-[13%] aspect-square rounded-xl bg-white/[0.025] items-center justify-center my-1"
              >
                <Text className="text-xs font-medium text-zinc-500">
                  {item.dayNumber}
                </Text>
              </View>
            );
          }

          // 4. Future / Upcoming Day: subtle distinct upcoming-day style (no heavy opacity reduction)
          return (
            <View
              key={`day-${item.dayNumber}`}
              className="w-[13%] aspect-square rounded-xl bg-white/[0.02] border border-white/[0.06] items-center justify-center my-1"
            >
              <Text className="text-xs font-semibold text-zinc-400">
                {item.dayNumber}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Micro Legend & Summary */}
      <View className="flex-row items-center justify-between pt-3 mt-2.5 border-t border-white/[0.06] px-1">
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1.5">
            <View className="w-2.5 h-2.5 rounded-sm bg-primary" />
            <Text className="text-[10px] text-zinc-400 font-medium">Latihan</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-2.5 h-2.5 rounded-sm bg-white/[0.08]" />
            <Text className="text-[10px] text-zinc-500 font-medium">Istirahat</Text>
          </View>
        </View>

        <Text className="text-[10px] text-zinc-400 font-medium">
          {calendarData.monthWorkoutsCount > 0
            ? `${calendarData.monthWorkoutsCount} hari aktif ${
                calendarData.isCurrentMonthView ? "bulan ini" : "di bulan ini"
              }`
            : "Belum ada latihan"}
        </Text>
      </View>
    </View>
  );
};
