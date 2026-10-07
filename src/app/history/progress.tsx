import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useHistoryStore } from "@/stores/historyStore";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExerciseProgressEntry } from "@/types/history";

interface GroupedProgressSession {
  sessionKey: string;
  date: string;
  workoutName: string;
  sets: ExerciseProgressEntry[];
  best1RM: number;
  maxWeight: number;
  totalVolume: number;
}

export default function ExerciseProgressScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const {
    activeExerciseProgress,
    selectedExerciseName,
    isLoading,
    fetchExerciseProgress,
    clearExerciseProgress,
  } = useHistoryStore();

  useEffect(() => {
    if (id) {
      fetchExerciseProgress(id, name || "Exercise");
    }
    return () => clearExerciseProgress();
  }, [id, name, fetchExerciseProgress, clearExerciseProgress]);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  // Group individual sets by workout session (date + workoutName)
  const groupedSessions = useMemo<GroupedProgressSession[]>(() => {
    if (!activeExerciseProgress || activeExerciseProgress.length === 0) return [];

    const map = new Map<string, GroupedProgressSession>();

    activeExerciseProgress.forEach((entry) => {
      // Group key: Date string (YYYY-MM-DD or full date) + workoutName
      const datePart = entry.date.split("T")[0] || entry.date;
      const sessionKey = `${datePart}_${entry.workoutName}`;

      if (!map.has(sessionKey)) {
        map.set(sessionKey, {
          sessionKey,
          date: entry.date,
          workoutName: entry.workoutName,
          sets: [],
          best1RM: 0,
          maxWeight: 0,
          totalVolume: 0,
        });
      }

      const group = map.get(sessionKey)!;
      group.sets.push(entry);
      if (entry.estimated1RM > group.best1RM) group.best1RM = entry.estimated1RM;
      if (entry.weight > group.maxWeight) group.maxWeight = entry.weight;
      group.totalVolume += entry.volume;
    });

    // Sort sets in each group by setNumber ascending
    map.forEach((g) => {
      g.sets.sort((a, b) => a.setNumber - b.setNumber);
    });

    // Return chronological or reverse chronological list (newest first)
    return Array.from(map.values());
  }, [activeExerciseProgress]);

  // Overall Best 1RM across all sessions for highlighting
  const allTimeMax1RM = useMemo(() => {
    if (groupedSessions.length === 0) return 0;
    return Math.max(...groupedSessions.map((g) => g.best1RM));
  }, [groupedSessions]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      {/* 1. Unified PageHeader */}
      <PageHeader
        title={selectedExerciseName || name || "Progres Latihan"}
        subtitle="Riwayat Rekor & Beban"
        fallbackRoute="/(tabs)/history"
      />

      {/* 2. Progression Subheader Banner */}
      <View className="px-5 py-3 bg-[#121212] border-b border-white/[0.06] flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-xs text-zinc-400">
            Riwayat beban bertahap dari waktu ke waktu
          </Text>
        </View>
        {allTimeMax1RM > 0 ? (
          <View className="flex-row items-center gap-1.5 px-2.5 py-1 bg-[#C7FF41]/10 border border-[#C7FF41]/25 rounded-full">
            <Text className="text-xs">🔥</Text>
            <Text className="text-[#C7FF41] text-[11px] font-bold">
              PR 1RM: {allTimeMax1RM} kg
            </Text>
          </View>
        ) : null}
      </View>

      {/* 3. Strength Progression Timeline (1 Date = 1 Grouped Surface) */}
      <View className="flex-1 px-5 pt-4">
        {isLoading && groupedSessions.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#C7FF41" />
            <Text className="text-text-secondary text-xs font-semibold mt-3">
              Memuat histori perkembangan beban...
            </Text>
          </View>
        ) : (
          <FlatList
            data={groupedSessions}
            keyExtractor={(item) => item.sessionKey}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 110 }}
            renderItem={({ item, index }) => {
              const isAllTimeBest = item.best1RM === allTimeMax1RM && allTimeMax1RM > 0;

              return (
                <View
                  style={{
                    backgroundColor: "#161616",
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: isAllTimeBest
                      ? "rgba(199, 255, 65, 0.35)"
                      : "rgba(255, 255, 255, 0.10)",
                    padding: 18,
                    marginBottom: 16,
                  }}
                >
                  {/* Timeline Header: Date • Workout Name & Best 1RM Badge */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-1 pr-2">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-[15px] font-bold text-white tracking-tight">
                          {formatDate(item.date)}
                        </Text>
                        {isAllTimeBest && (
                          <View className="px-1.5 py-0.5 rounded bg-[#C7FF41]/15 border border-[#C7FF41]/30">
                            <Text className="text-[#C7FF41] text-[9px] font-black uppercase tracking-wider">
                              Rekor PR
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-xs text-zinc-400 mt-0.5">
                        {item.workoutName}
                      </Text>
                    </View>

                    {/* Session Best 1RM Pill */}
                    <View className="items-end">
                      <Text className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                        Est. 1RM
                      </Text>
                      <Text className="text-sm font-extrabold text-[#C7FF41] mt-0.5">
                        {item.best1RM} <Text className="text-[11px] font-normal text-zinc-400">kg</Text>
                      </Text>
                    </View>
                  </View>

                  {/* Sub-header labels (no spreadsheet box) */}
                  <View className="flex-row items-center justify-between pb-1.5 pt-2 border-t border-white/[0.07]">
                    <Text className="w-12 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Set
                    </Text>
                    <Text className="flex-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-left pl-2">
                      Beban × Reps
                    </Text>
                    <Text className="w-24 text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-right">
                      Est. 1RM
                    </Text>
                  </View>

                  {/* Grouped Sets List */}
                  {item.sets.map((s, sIdx) => {
                    const isSetBest = s.estimated1RM === item.best1RM;

                    return (
                      <View
                        key={s.setId || sIdx}
                        className={`flex-row items-center justify-between py-2 ${
                          sIdx < item.sets.length - 1 ? "border-b border-white/[0.04]" : ""
                        }`}
                      >
                        {/* Set Pill */}
                        <View className="w-12">
                          <View className="w-5 h-5 rounded-full bg-white/[0.06] items-center justify-center">
                            <Text className="text-[11px] font-bold text-zinc-300">
                              {s.setNumber}
                            </Text>
                          </View>
                        </View>

                        {/* Weight × Reps */}
                        <View className="flex-1 pl-2">
                          <Text className="text-sm font-semibold text-white tracking-tight">
                            {s.weight} kg <Text className="text-zinc-500 font-normal">×</Text> {s.reps} reps
                          </Text>
                        </View>

                        {/* Est 1RM column */}
                        <View className="w-24 items-end flex-row justify-end items-center gap-1.5">
                          <Text
                            className={`text-xs font-bold ${
                              isSetBest ? "text-[#C7FF41]" : "text-zinc-400"
                            }`}
                          >
                            {s.estimated1RM} kg
                          </Text>
                          {isSetBest && (
                            <View className="w-1.5 h-1.5 rounded-full bg-[#C7FF41]" />
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              );
            }}
            ListEmptyComponent={
              <EmptyState
                icon="📊"
                title="Belum Ada Log Latihan"
                message="Latihan ini belum pernah dicatat dalam sesi latihanmu."
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

