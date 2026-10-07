import React, { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAuthStore } from "@/stores/authStore";
import { useActiveWorkoutStore } from "@/stores/activeWorkoutStore";
import { useHistoryStore } from "@/stores/historyStore";
import { useWorkoutStore } from "@/stores/workoutStore";
import { useAnalyticsStore } from "@/stores/analyticsStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    hasRecoverableSession,
    checkForRecoverableSession,
    recoverSession,
    discardWorkout,
  } = useActiveWorkoutStore();

  const { sessions, prRecords, fetchCompletedSessions, fetchPRRecords } =
    useHistoryStore();
  const { templates, fetchTemplates } = useWorkoutStore();
  const { summary, fetchAnalytics } = useAnalyticsStore();

  useEffect(() => {
    checkForRecoverableSession();
    fetchPRRecords();
    fetchTemplates();

    const loadHomeData = async () => {
      await fetchCompletedSessions();
      const currentSessions = useHistoryStore.getState().sessions;
      await fetchAnalytics(currentSessions);
    };

    loadHomeData();
  }, [
    checkForRecoverableSession,
    fetchCompletedSessions,
    fetchPRRecords,
    fetchTemplates,
    fetchAnalytics,
  ]);

  const handleResumeWorkout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await recoverSession();
    if (success) {
      router.push("/workout/active");
    }
  };

  const handleDiscardSavedSession = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await discardWorkout();
  };

  const currentWeeklyWorkouts = summary?.weeklyWorkoutsCount ?? 0;
  const currentWeeklyVolume = summary?.weeklyVolume ?? 0;
  const currentWeeklyDuration = summary?.weeklyDurationSeconds ?? 0;

  const firstName =
    user?.displayName?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Sobat Gym";

  const nextTargetTemplate = templates.length > 0 ? templates[0] : null;
  const recentWorkout = sessions.length > 0 ? sessions[0] : null;

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return "0 mnt";
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      return `${hrs}j ${mins % 60}m`;
    }
    return `${mins} mnt`;
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    } catch {
      return "";
    }
  };

  const todayFormatted = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* RECOVERY BANNER (Resume Unfinished Workout) */}
        {hasRecoverableSession ? (
          <Card className="my-4 border-[#C7FF41]/40 bg-surface">
            <View className="flex-row items-center gap-2 mb-1.5">
              <View className="w-2 h-2 rounded-full bg-[#C7FF41]" />
              <Text className="text-[#C7FF41] text-xs font-bold uppercase tracking-wider">
                Sesi Latihan Masih Berjalan
              </Text>
            </View>
            <Text className="text-white text-sm font-semibold mb-3">
              Ada sesi latihan yang belum diselesaikan. Lanjutkan sekarang?
            </Text>
            <View className="flex-row items-center gap-2">
              <View className="flex-1">
                <Button
                  label="Lanjutkan Latihan →"
                  size="md"
                  onPress={handleResumeWorkout}
                />
              </View>
              <Button
                label="Batal"
                size="md"
                variant="secondary"
                onPress={handleDiscardSavedSession}
              />
            </View>
          </Card>
        ) : null}

        {/* 1. Greeting & Profile Shortcut */}
        <View className="pt-4 pb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
              {todayFormatted}
            </Text>
            <Text className="text-2xl font-black text-white mt-0.5 tracking-tight">
              Halo, {firstName}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
            className="w-11 h-11 rounded-full bg-surface border border-white/[0.08] items-center justify-center"
          >
            <Text className="text-[#C7FF41] font-black text-base">
              {firstName.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 2. Hero Metric Card: Aktivitas Pekan Ini (One Source of Truth, No Triple Counting) */}
        <Card className="mb-6 p-5 border-white/[0.08] bg-surface">
          <View className="flex-row items-center gap-2 mb-2">
            <View className="w-2 h-2 rounded-full bg-[#C7FF41]" />
            <Text className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Aktivitas Pekan Ini
            </Text>
          </View>

          {/* Big Headline: Weekly Volume as primary focus */}
          <View className="flex-row items-baseline gap-1.5 mb-1">
            <Text className="text-4xl font-black text-white tracking-tight">
              {currentWeeklyVolume.toLocaleString("id-ID")}
            </Text>
            <Text className="text-lg font-bold text-[#C7FF41]">kg</Text>
          </View>

          <Text className="text-xs text-text-secondary mb-4">
            {currentWeeklyWorkouts > 0
              ? `${currentWeeklyWorkouts} sesi diselesaikan dalam 7 hari terakhir`
              : "Belum ada sesi latihan dalam 7 hari terakhir"}
          </Text>

          {/* Clean 2-Item Metric Ground Strip (Sesi & PR, no redundant volume or triple counted session badge) */}
          <View className="flex-row items-center justify-between pt-3 border-t border-white/[0.08]">
            <View className="items-center flex-1">
              <Text className="text-text-secondary text-[11px] font-medium">Sesi Latihan</Text>
              <Text className="text-lg font-black text-white mt-0.5">
                {currentWeeklyWorkouts}
              </Text>
            </View>
            <View className="w-[1px] h-6 bg-white/[0.08]" />
            <View className="items-center flex-1">
              <Text className="text-text-secondary text-[11px] font-medium">Rekor PR</Text>
              <Text className="text-lg font-black text-[#C7FF41] mt-0.5">
                {prRecords.length}
              </Text>
            </View>
          </View>
        </Card>

        {/* 3. Primary Workout Target Hero Card */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white text-base font-black tracking-tight">
              Jadwal Latihan
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => router.push("/(tabs)/workout")}
            >
              <Text className="text-text-secondary text-xs font-semibold">
                Lihat Semua
              </Text>
            </TouchableOpacity>
          </View>

          {nextTargetTemplate ? (
            <Card className="p-5 border-white/[0.08] bg-surface">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xl font-black text-white tracking-tight flex-1 mr-2" numberOfLines={1}>
                  {nextTargetTemplate.name}
                </Text>
                <View className="bg-background px-3 py-1 rounded-full border border-white/[0.08]">
                  <Text className="text-[#C7FF41] text-xs font-bold">
                    {nextTargetTemplate.exercise_count || 0} Latihan
                  </Text>
                </View>
              </View>

              {/* Sub-metrics: Durasi & Est */}
              <View className="flex-row items-center gap-2 mb-5">
                <Text className="text-text-secondary text-xs font-medium">
                  ~{Math.max((nextTargetTemplate.exercise_count || 3) * 10, 30)} menit
                </Text>
                <Text className="text-text-secondary text-xs">•</Text>
                <Text className="text-text-secondary text-xs font-medium">
                  Target beban progresif
                </Text>
              </View>

              <Button
                label="Mulai Latihan →"
                size="lg"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push({
                    pathname: "/workout/[id]",
                    params: { id: nextTargetTemplate.id },
                  });
                }}
              />
            </Card>
          ) : (
            <EmptyState
              title="Belum Ada Template"
              message="Buat template latihan untuk mulai mencatat beban dan repetisi."
              actionLabel="+ Buat Template"
              onAction={() => router.push("/(tabs)/workout")}
            />
          )}
        </View>

        {/* 4. Rekor Pribadi (PR) */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white text-base font-black tracking-tight">
              Rekor Pribadi (PR)
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
              <Text className="text-text-secondary text-xs font-semibold">
                Lihat Semua
              </Text>
            </TouchableOpacity>
          </View>

          {prRecords.length === 0 ? (
            <EmptyState
              title="Belum Ada Rekor"
              message="Rekor beban tertinggi (PR) akan tercatat otomatis saat sesi latihan selesai."
              actionLabel="Mulai Latihan"
              onAction={() => router.push("/(tabs)/workout")}
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-5 px-5"
            >
              {prRecords.slice(0, 5).map((pr) => (
                <Card
                  key={pr.exerciseId}
                  className="mr-3 w-40 p-4 border-white/[0.08]"
                >
                  <Text className="text-text-secondary text-xs font-semibold" numberOfLines={1}>
                    {pr.exerciseName}
                  </Text>
                  <View className="flex-row items-baseline mt-2 gap-1">
                    <Text className="text-2xl font-black text-[#C7FF41]">
                      {pr.weightPR}
                    </Text>
                    <Text className="text-xs text-text-secondary font-bold">
                      kg
                    </Text>
                  </View>
                  <Text className="text-text-secondary text-[11px] font-medium mt-1">
                    Est. 1RM: <Text className="text-white font-bold">{pr.estimated1RM} kg</Text>
                  </Text>
                </Card>
              ))}
            </ScrollView>
          )}
        </View>

        {/* 5. Riwayat Latihan Terakhir */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white text-base font-black tracking-tight">
              Latihan Terakhir
            </Text>
            {recentWorkout ? (
              <Text className="text-text-secondary text-xs font-medium">
                {formatDate(recentWorkout.completed_at || recentWorkout.started_at)}
              </Text>
            ) : null}
          </View>

          {!recentWorkout ? (
            <EmptyState
              title="Belum Ada Latihan"
              message="Riwayat sesi latihan dan total beban akan muncul di sini setelah sesi selesai."
            />
          ) : (
            <Card
              interactive
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({
                  pathname: "/history/[id]",
                  params: { id: recentWorkout.id },
                });
              }}
              className="p-5 border-white/[0.08]"
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-black text-white tracking-tight" numberOfLines={1}>
                  {recentWorkout.workout_name}
                </Text>
                <View className="bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <Text className="text-emerald-400 text-[11px] font-bold">
                    Selesai
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between bg-background rounded-2xl p-3.5 border border-white/[0.08]">
                <View>
                  <Text className="text-[11px] text-text-secondary font-medium">Durasi</Text>
                  <Text className="text-xs font-bold text-white mt-0.5">
                    {formatDuration(recentWorkout.duration_seconds)}
                  </Text>
                </View>
                <View>
                  <Text className="text-[11px] text-text-secondary font-medium">Volume</Text>
                  <Text className="text-xs font-black text-[#C7FF41] mt-0.5">
                    {recentWorkout.total_volume} kg
                  </Text>
                </View>
                <View>
                  <Text className="text-[11px] text-text-secondary font-medium">Total Set</Text>
                  <Text className="text-xs font-bold text-white mt-0.5">
                    {recentWorkout.total_sets} Set
                  </Text>
                </View>
              </View>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
