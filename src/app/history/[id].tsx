import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useHistoryStore } from "@/stores/historyStore";
import { PageHeader } from "@/components/ui/PageHeader";

export default function HistoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeDetail, isLoading, fetchSessionDetail, clearDetail } = useHistoryStore();

  useEffect(() => {
    if (id) {
      fetchSessionDetail(id);
    }
    return () => clearDetail();
  }, [id, fetchSessionDetail, clearDetail]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) {
      return `${hrs} jam ${mins} mnt`;
    }
    return `${mins} menit`;
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  if (isLoading || !activeDetail) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#C7FF41" />
        <Text className="text-text-secondary text-xs font-semibold mt-3">
          Memuat ringkasan latihan...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      {/* 1. Unified PageHeader */}
      <PageHeader
        title="Detail Latihan"
        subtitle={activeDetail.workout_name}
        fallbackRoute="/(tabs)/history"
      />

      <ScrollView
        className="flex-1 px-5 pt-3"
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Workout Summary Card: 1 Workout Summary = 1 Surface */}
        <View
          style={{
            backgroundColor: "#161616",
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.10)",
            padding: 18,
            marginBottom: 20,
          }}
        >
          {/* Header Title & Date */}
          <Text className="text-[22px] font-bold text-white tracking-tight">
            {activeDetail.workout_name}
          </Text>
          <Text className="text-xs text-zinc-400 font-medium mt-1 mb-4">
            {formatDate(activeDetail.completed_at || activeDetail.started_at)}
          </Text>

          {/* Integrated Summary Metrics Ribbon (No nested card) */}
          <View className="flex-row items-center justify-between pt-3.5 border-t border-white/[0.07]">
            {/* Durasi */}
            <View className="flex-1">
              <Text className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-0.5">
                Waktu
              </Text>
              <Text className="text-base font-bold text-white font-mono">
                {formatDuration(activeDetail.duration_seconds)}
              </Text>
            </View>

            {/* Volume */}
            <View className="flex-1 items-center">
              <Text className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-0.5">
                Volume
              </Text>
              <Text className="text-base font-extrabold text-[#C7FF41]">
                {activeDetail.total_volume} <Text className="text-[11px] font-normal text-zinc-400">kg</Text>
              </Text>
            </View>

            {/* Total Set */}
            <View className="flex-1 items-end">
              <Text className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-0.5">
                Total Set
              </Text>
              <Text className="text-base font-bold text-white">
                {activeDetail.total_sets} Set
              </Text>
            </View>
          </View>
        </View>

        {/* 3. Section Title */}
        <View className="flex-row items-center justify-between px-1 mb-3">
          <Text className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Latihan ({activeDetail.exerciseGroups.length})
          </Text>
        </View>

        {/* 4. Exercise Sections: 1 Exercise = 1 Surface (Hevy / Strong Workout Log Pattern) */}
        {activeDetail.exerciseGroups.map((group, gIdx) => (
          <View
            key={group.exerciseId || gIdx}
            style={{
              backgroundColor: "#161616",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.10)",
              padding: 18,
              marginBottom: 16,
            }}
          >
            {/* Exercise Header: Name, Muscle Badge & Exercise Volume */}
            <View className="flex-row items-start justify-between mb-3.5">
              <View className="flex-1 pr-3">
                <Text className="text-base font-bold text-white tracking-tight" numberOfLines={1}>
                  {group.exerciseName}
                </Text>
                <View className="bg-white/[0.06] self-start px-2 py-0.5 rounded-md border border-white/[0.08] mt-1.5">
                  <Text className="text-zinc-300 text-[10px] font-semibold uppercase tracking-wide">
                    {group.primaryMuscle}
                  </Text>
                </View>
              </View>

              <View className="items-end pt-0.5">
                <Text className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  Volume
                </Text>
                <Text className="text-sm font-bold text-white mt-0.5">
                  {group.totalVolume} <Text className="text-[11px] font-normal text-zinc-400">kg</Text>
                </Text>
              </View>
            </View>

            {/* Set List Header (Subtle typographic column labels without table box) */}
            <View className="flex-row items-center justify-between pb-1.5 border-b border-white/[0.07]">
              <Text className="w-10 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Set
              </Text>
              <Text className="flex-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-left pl-2">
                Beban × Reps
              </Text>
              <Text className="w-20 text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-right">
                Volume
              </Text>
            </View>

            {/* Set Entries: Natural Workout Log Rows */}
            {group.sets.map((s, sIdx) => (
              <View
                key={s.id || sIdx}
                className={`flex-row items-center justify-between py-2.5 ${
                  sIdx < group.sets.length - 1 ? "border-b border-white/[0.04]" : ""
                }`}
              >
                {/* Set Number Pill */}
                <View className="w-10">
                  <View className="w-5 h-5 rounded-full bg-white/[0.06] items-center justify-center">
                    <Text className="text-[11px] font-bold text-[#C7FF41]">
                      {s.set_number}
                    </Text>
                  </View>
                </View>

                {/* Weight × Reps */}
                <View className="flex-1 pl-2">
                  <Text className="text-sm font-semibold text-white tracking-tight">
                    {s.weight} kg <Text className="text-zinc-500 font-normal">×</Text> {s.reps} reps
                  </Text>
                </View>

                {/* Volume Output */}
                <View className="w-20 items-end">
                  <Text className="text-xs font-semibold text-zinc-300">
                    {s.volume} kg
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
