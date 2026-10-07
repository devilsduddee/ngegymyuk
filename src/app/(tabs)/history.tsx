import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useHistoryStore } from "@/stores/historyStore";
import { WorkoutSession } from "@/types/session";
import { ExercisePRRecord } from "@/types/history";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getLocalDateKey } from "@/features/analytics/services/analyticsService";

const MONTH_NAMES_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Ags",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export default function HistoryScreen() {
  const router = useRouter();
  const {
    sessions,
    prRecords,
    isLoading,
    fetchCompletedSessions,
    fetchPRRecords,
    fetchExerciseProgress,
  } = useHistoryStore();

  const [activeTab, setActiveTab] = useState<"workouts" | "prs">("workouts");

  useEffect(() => {
    fetchCompletedSessions();
    fetchPRRecords();
  }, [fetchCompletedSessions, fetchPRRecords]);

  // Format Elapsed Time (e.g. 1h 12m or 48m)
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Format ISO Date (e.g. 13 Sep 2026, 14:30)
  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const handleOpenDetail = (session: WorkoutSession) => {
    router.push({
      pathname: "/history/[id]",
      params: { id: session.id },
    });
  };

  const handleOpenProgress = (record: ExercisePRRecord) => {
    fetchExerciseProgress(record.exerciseId, record.exerciseName);
    router.push({
      pathname: "/history/progress",
      params: { id: record.exerciseId, name: record.exerciseName },
    });
  };

  // Weekly Training Rhythm (Dynamic Monday-Sunday consistency tracker)
  const weeklyRhythm = useMemo(() => {
    const now = new Date();
    const todayKey = getLocalDateKey(now);

    // Monday as start of week (0 = Sun -> offset -6; 1 = Mon -> offset 0; etc.)
    const currentDay = now.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // Build Set of unique local active date keys from completed sessions
    const activeDateKeysSet = new Set<string>();
    for (let i = 0; i < sessions.length; i++) {
      const s = sessions[i];
      const rawDate = s.completed_at || s.started_at;
      if (!rawDate) continue;
      activeDateKeysSet.add(getLocalDateKey(new Date(rawDate)));
    }

    // Days mapping: Mon, Tue, Wed, Thu, Fri, Sat, Sun
    const dayHeaders = [
      { label: "Sen", fullLabel: "Senin" },
      { label: "Sel", fullLabel: "Selasa" },
      { label: "Rab", fullLabel: "Rabu" },
      { label: "Kam", fullLabel: "Kamis" },
      { label: "Jum", fullLabel: "Jumat" },
      { label: "Sab", fullLabel: "Sabtu" },
      { label: "Min", fullLabel: "Minggu" },
    ];

    // Find workouts completed on each day of this week
    const result = dayHeaders.map((d, index) => {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + index);
      const dayKey = getLocalDateKey(dayDate);

      const isToday = dayKey === todayKey;
      const isPast = dayDate.getTime() < now.getTime() && !isToday;
      const hasWorkout = activeDateKeysSet.has(dayKey);

      return {
        label: d.label,
        dateNum: dayDate.getDate(),
        dateKey: dayKey,
        hasWorkout,
        isToday,
        isPast,
      };
    });

    // Unique active days count in the current 7-day week (0 to 7)
    const uniqueActiveDaysCount = result.filter((r) => r.hasWorkout).length;

    // Week date range label (e.g. "14 Sep - 20 Sep 2026" or "28 Des - 3 Jan 2027")
    const weekRangeLabel =
      monday.getMonth() === sunday.getMonth() && monday.getFullYear() === sunday.getFullYear()
        ? `${monday.getDate()} - ${sunday.getDate()} ${MONTH_NAMES_SHORT[sunday.getMonth()]} ${sunday.getFullYear()}`
        : monday.getFullYear() === sunday.getFullYear()
        ? `${monday.getDate()} ${MONTH_NAMES_SHORT[monday.getMonth()]} - ${sunday.getDate()} ${MONTH_NAMES_SHORT[sunday.getMonth()]} ${sunday.getFullYear()}`
        : `${monday.getDate()} ${MONTH_NAMES_SHORT[monday.getMonth()]} ${monday.getFullYear()} - ${sunday.getDate()} ${MONTH_NAMES_SHORT[sunday.getMonth()]} ${sunday.getFullYear()}`;

    return {
      days: result,
      completedCount: uniqueActiveDaysCount,
      weekRangeLabel,
    };
  }, [sessions]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* 1. Header Bar with Streamlined Segmented Control */}
      <View className="px-5 pt-3 pb-2">
        <Text className="text-2xl font-black text-white tracking-tight">
          Riwayat & Rekor
        </Text>
        <Text className="text-xs text-text-secondary mt-0.5 font-medium">
          Log sesi latihan dan rekor angkatan
        </Text>

        {/* Streamlined Segmented Control */}
        <View className="flex-row bg-[#141414] p-1 rounded-xl border border-white/[0.06] mt-3.5">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab("workouts")}
            className={`flex-1 py-2 rounded-lg items-center justify-center min-h-[38px] ${
              activeTab === "workouts" ? "bg-[#202020]" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-xs font-bold tracking-tight ${
                activeTab === "workouts" ? "text-[#C7FF41]" : "text-zinc-400"
              }`}
            >
              Log Latihan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab("prs")}
            className={`flex-1 py-2 rounded-lg items-center justify-center min-h-[38px] ${
              activeTab === "prs" ? "bg-[#202020]" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-xs font-bold tracking-tight ${
                activeTab === "prs" ? "text-[#C7FF41]" : "text-zinc-400"
              }`}
            >
              Rekor Pribadi (PR)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Weekly Training Rhythm Section (Hevy & GitHub Heatmap Philosophy) */}
      <View className="px-5 pt-1 pb-3">
        <View
          style={{
            backgroundColor: "#141414",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.07)",
            paddingHorizontal: 14,
            paddingVertical: 12,
          }}
        >
          {/* Consistency Header Subline */}
          <View className="flex-row items-center justify-between mb-2.5">
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="flame" size={14} color="#C7FF41" />
              <Text className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                Ritme Minggu Ini
              </Text>
              <Text className="text-[10px] text-zinc-500 font-medium">
                • {weeklyRhythm.weekRangeLabel}
              </Text>
            </View>

            <Text className="text-[11px] font-bold text-[#C7FF41]">
              {weeklyRhythm.completedCount} <Text className="text-zinc-400 font-normal">dari 7 hari</Text>
            </Text>
          </View>

          {/* 7-Day Rhythm Strip */}
          <View className="flex-row items-center justify-between">
            {weeklyRhythm.days.map((day, idx) => (
              <View key={idx} className="items-center flex-1">
                {/* Day Label (Mon-Sun) */}
                <Text
                  className={`text-[10px] font-bold uppercase mb-1.5 ${
                    day.isToday ? "text-[#C7FF41]" : "text-zinc-400"
                  }`}
                >
                  {day.label}
                </Text>

                {/* Day Node Indicator */}
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: day.hasWorkout
                      ? "#C7FF41"
                      : day.isToday
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(255, 255, 255, 0.03)",
                    borderWidth: 1,
                    borderColor: day.hasWorkout
                      ? "#C7FF41"
                      : day.isToday
                      ? "rgba(199, 255, 65, 0.4)"
                      : "rgba(255, 255, 255, 0.06)",
                  }}
                >
                  {day.hasWorkout ? (
                    <Ionicons name="checkmark-sharp" size={16} color="#080808" />
                  ) : (
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: day.isToday ? "700" : "500",
                        color: day.isToday ? "#FFFFFF" : "#52525B",
                      }}
                    >
                      {day.dateNum}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 3. Content List */}
      <View className="flex-1 px-5 pt-1">
        {isLoading && sessions.length === 0 && prRecords.length === 0 ? (
          <View className="flex-1 items-center justify-center py-24">
            <ActivityIndicator size="large" color="#C7FF41" />
            <Text className="text-text-secondary text-xs font-medium mt-3">
              Memuat data aktivitas...
            </Text>
          </View>
        ) : activeTab === "workouts" ? (
          /* WORKOUT SESSIONS FEED (Hevy / Strong Unified Log Pattern) */
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 110, paddingTop: 6 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.78}
                onPress={() => handleOpenDetail(item)}
                style={{
                  backgroundColor: "#161616",
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.10)",
                  padding: 18,
                  marginBottom: 16,
                }}
              >
                {/* 1. Header Row: Workout Name & Chevron */}
                <View className="flex-row items-center justify-between">
                  <Text
                    className="text-[17px] font-bold text-white tracking-tight flex-1 pr-3"
                    numberOfLines={1}
                  >
                    {item.workout_name}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#71717A" />
                </View>

                {/* 2. Metadata Subline: Date & Subtle Status Pill */}
                <View className="flex-row items-center justify-between mt-1.5 mb-4">
                  <Text className="text-xs text-zinc-400 font-medium">
                    {formatDate(item.completed_at || item.started_at)}
                  </Text>
                  <View className="flex-row items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#C7FF41]/10 border border-[#C7FF41]/20">
                    <View className="w-1.5 h-1.5 rounded-full bg-[#C7FF41]" />
                    <Text className="text-[#C7FF41] text-[10px] font-bold uppercase tracking-wider">
                      Selesai
                    </Text>
                  </View>
                </View>

                {/* 3. Integrated Workout Metrics Ribbon (Natural Journal Flow) */}
                <View className="flex-row items-center justify-between pt-3 border-t border-white/[0.07]">
                  {/* Waktu */}
                  <View className="flex-1">
                    <Text className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-0.5">
                      Waktu
                    </Text>
                    <Text className="text-sm font-semibold text-white font-mono">
                      {formatDuration(item.duration_seconds)}
                    </Text>
                  </View>

                  {/* Volume */}
                  <View className="flex-1 items-center">
                    <Text className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-0.5">
                      Volume
                    </Text>
                    <Text className="text-sm font-extrabold text-[#C7FF41]">
                      {item.total_volume} <Text className="text-[11px] font-normal text-zinc-400">kg</Text>
                    </Text>
                  </View>

                  {/* Total Set */}
                  <View className="flex-1 items-end">
                    <Text className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-0.5">
                      Total Set
                    </Text>
                    <Text className="text-sm font-semibold text-white">
                      {item.total_sets} Set
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <EmptyState
                icon={<Ionicons name="calendar-outline" size={28} color="#71717A" />}
                title="Belum Ada Log Latihan"
                message="Selesaikan sesi latihan untuk melihat histori beban dan volume."
                actionLabel="Mulai Latihan"
                onAction={() => router.push("/(tabs)/workout")}
              />
            }
          />
        ) : (
          /* PERSONAL RECORDS LIST PER EXERCISE (Unified Log Pattern) */
          <FlatList
            data={prRecords}
            keyExtractor={(item) => item.exerciseId}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 110, paddingTop: 6 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.78}
                onPress={() => handleOpenProgress(item)}
                style={{
                  backgroundColor: "#161616",
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.10)",
                  padding: 18,
                  marginBottom: 16,
                }}
              >
                {/* 1. Exercise Name & Chevron */}
                <View className="flex-row items-center justify-between">
                  <Text
                    className="text-[17px] font-bold text-white tracking-tight flex-1 pr-3"
                    numberOfLines={1}
                  >
                    {item.exerciseName}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#71717A" />
                </View>

                {/* 2. Target Muscle Pill */}
                <View className="flex-row items-center mt-1.5 mb-4">
                  <View className="bg-white/[0.06] px-2 py-0.5 rounded-md border border-white/[0.08]">
                    <Text className="text-zinc-300 text-[10px] font-semibold">
                      {item.primaryMuscle}
                    </Text>
                  </View>
                </View>

                {/* 3. Record Metrics Ribbon */}
                <View className="flex-row items-center justify-between pt-3 border-t border-white/[0.07]">
                  <View className="flex-1">
                    <Text className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-0.5">
                      Rekor Beban
                    </Text>
                    <Text className="text-sm font-extrabold text-[#C7FF41]">
                      {item.weightPR} <Text className="text-[11px] font-normal text-zinc-400">kg</Text>
                    </Text>
                  </View>

                  <View className="flex-1 items-center">
                    <Text className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-0.5">
                      Rekor Volume
                    </Text>
                    <Text className="text-sm font-semibold text-white">
                      {item.volumePR} <Text className="text-[11px] font-normal text-zinc-400">kg</Text>
                    </Text>
                  </View>

                  <View className="flex-1 items-end">
                    <Text className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-0.5">
                      Estimasi 1RM
                    </Text>
                    <Text className="text-sm font-semibold text-accent">
                      {item.estimated1RM} <Text className="text-[11px] font-normal text-zinc-400">kg</Text>
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <EmptyState
                icon={<Ionicons name="trophy-outline" size={28} color="#71717A" />}
                title="Belum Ada Rekor"
                message="Rekor pribadi akan tercatat otomatis saat kamu mengangkat beban terberat baru."
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

