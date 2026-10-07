import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, Easing } from "react-native-reanimated";
import { useAnalyticsStore } from "@/stores/analyticsStore";
import { BarChart, LineChart } from "react-native-gifted-charts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  formatDurationHuman,
  formatDurationCompact,
  formatKg,
} from "@/utils/formatters";
import { useHistoryStore } from "@/stores/historyStore";
import { MonthlyTrainingCalendar } from "@/features/analytics/components/MonthlyTrainingCalendar";

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const SECTION_ENTER_1 = FadeInDown.duration(240).easing(EASE_OUT);
const SECTION_ENTER_2 = FadeInDown.duration(240).delay(40).easing(EASE_OUT);
const SECTION_ENTER_3 = FadeInDown.duration(240).delay(80).easing(EASE_OUT);
const SECTION_ENTER_4 = FadeInDown.duration(240).delay(120).easing(EASE_OUT);
const SECTION_ENTER_5 = FadeInDown.duration(240).delay(160).easing(EASE_OUT);
const SECTION_ENTER_6 = FadeInDown.duration(240).delay(200).easing(EASE_OUT);


export default function AnalyticsScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const { summary, isLoading, fetchAnalytics } = useAnalyticsStore();
  const { sessions, fetchCompletedSessions } = useHistoryStore();

  useEffect(() => {
    fetchAnalytics();
    if (sessions.length === 0) {
      fetchCompletedSessions();
    }
  }, [fetchAnalytics, fetchCompletedSessions, sessions.length]);

  if (isLoading || !summary) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#C7FF41" />
        <Text className="text-text-secondary text-xs font-semibold mt-3">
          Memuat statistik latihan...
        </Text>
      </SafeAreaView>
    );
  }

  // 1. Overall Empty State Check (If user has 0 workouts)
  if (summary.totalWorkouts === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="px-5 pt-3 pb-2">
          <Text className="text-2xl font-black text-white tracking-tight">
            Statistik
          </Text>
          <Text className="text-xs font-normal text-text-secondary mt-0.5">
            Volume latihan, konsistensi mingguan, dan sebaran otot
          </Text>
        </View>

        <View className="flex-1 justify-center px-5">
          <EmptyState
            icon={<Ionicons name="stats-chart" size={32} color="#C7FF41" />}
            title="Belum Ada Data Latihan"
            message="Selesaikan sesi latihan pertamamu untuk melihat grafik volume dan konsistensi latihan."
            actionLabel="Mulai Latihan"
            onAction={() => router.push("/(tabs)/workout")}
          />
        </View>
      </SafeAreaView>
    );
  }

  // 2. Chart Dimension Calculations
  const availableChartWidth = Math.max(windowWidth - 100, 240);
  const dynamicBarSpacing = Math.max(Math.floor((availableChartWidth - 7 * 20) / 7), 10);
  const dynamicLineSpacing = Math.max(Math.floor((availableChartWidth - 36) / 4), 32);

  // Maximum weekly volume for chart scaling
  const maxWeeklyVal = Math.max(...summary.weeklyVolumeChart.map((d) => d.value), 0);
  const chartMaxWeekly = maxWeeklyVal > 0 ? Math.ceil(maxWeeklyVal * 1.2) : 500;

  // Format data for Gifted Bar Chart (DESIGN.md Performance Lime #C7FF41)
  const weeklyChartData = summary.weeklyVolumeChart.map((item) => ({
    value: item.value,
    label: item.day,
    frontColor: item.value > 0 ? "#C7FF41" : "rgba(255, 255, 255, 0.08)",
    topLabelComponent: () =>
      item.value > 0 ? (
        <Text className="text-[10px] text-white font-bold -mb-1 text-center">
          {formatKg(item.value)}
        </Text>
      ) : null,
  }));

  // Format data for Gifted Line Chart
  const monthlyChartData = summary.monthlyWorkoutChart.map((item) => ({
    value: item.value,
    label: item.month,
    dataPointText: item.value > 0 ? String(item.value) : "",
    textColor: "#FFFFFF",
  }));

  const maxMonthlyVal = Math.max(...summary.monthlyWorkoutChart.map((d) => d.value), 0);
  const chartMaxMonthly = Math.max(maxMonthlyVal + 2, 6);

  // Weekly Trend Helpers
  const { volumeChangePercent, volumeTrend, mostFrequentWorkout, dominantMuscle } =
    summary.weeklyInsight;

  const renderTrendBadge = () => {
    if (volumeTrend === "up") {
      return (
        <View className="flex-row items-center bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full">
          <Ionicons name="arrow-up" size={12} color="#10B981" />
          <Text className="text-emerald-400 text-xs font-bold ml-1">
            +{volumeChangePercent}% vs mgg lalu
          </Text>
        </View>
      );
    }
    if (volumeTrend === "down") {
      return (
        <View className="flex-row items-center bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 rounded-full">
          <Ionicons name="arrow-down" size={12} color="#F43F5E" />
          <Text className="text-rose-400 text-xs font-bold ml-1">
            {volumeChangePercent}% vs mgg lalu
          </Text>
        </View>
      );
    }
    if (volumeTrend === "same") {
      return (
        <View className="flex-row items-center bg-zinc-800 px-2.5 py-1 rounded-full border border-zinc-700">
          <Text className="text-zinc-300 text-xs font-semibold">
            Stabil vs mgg lalu
          </Text>
        </View>
      );
    }
    return (
      <View className="flex-row items-center bg-zinc-800/80 px-2.5 py-1 rounded-full border border-zinc-700/60">
        <Text className="text-zinc-400 text-xs font-medium">Minggu Awal</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1 px-5 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Screen Header */}
        <View className="pt-2 pb-6">
          <Text className="text-3xl font-black text-white tracking-tight">
            Statistik
          </Text>
          <Text className="text-xs text-zinc-400 mt-1">
            Volume latihan, konsistensi mingguan, dan sebaran kelompok otot
          </Text>
        </View>

        {/* 1. Primary Hero Volume Card */}
        <Animated.View entering={SECTION_ENTER_1}>
          <View
            style={{ marginBottom: 24 }}
            className="p-6 rounded-3xl bg-[#121212] border border-white/[0.08]"
          >
            <View className="flex-row items-center justify-between mb-3.5">
              <Text className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Volume 7 Hari Terakhir
              </Text>
              {renderTrendBadge()}
            </View>

            {/* Hero Metric */}
            <View className="flex-row items-baseline gap-2 mb-2">
              <Text className="text-5xl font-black text-white tracking-tight">
                {summary.weeklyVolume.toLocaleString("id-ID")}
              </Text>
              <Text className="text-xl font-black text-[#C7FF41]">kg</Text>
            </View>

            <Text className="text-xs text-zinc-400 font-medium">
              {summary.weeklyWorkoutsCount} sesi latihan • Durasi total{" "}
              {formatDurationHuman(summary.weeklyDurationSeconds)}
            </Text>
          </View>
        </Animated.View>

        {/* 2. Training Consistency Calendar Card */}
        <Animated.View entering={SECTION_ENTER_2} style={{ marginBottom: 24 }}>
          <MonthlyTrainingCalendar sessions={sessions} />
        </Animated.View>

        {/* 3. Weekly Trend Card */}
        <Animated.View entering={SECTION_ENTER_3}>
          <View
            style={{ marginBottom: 24 }}
            className="p-5 rounded-3xl bg-[#121212] border border-white/[0.08]"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm font-bold text-white tracking-tight">
                Tren Volume Harian
              </Text>
              <Text className="text-xs font-semibold text-zinc-400">
                7 Hari Terakhir
              </Text>
            </View>

            {summary.activeWeeklyDaysCount < 3 ? (
              <View className="py-6 px-3 items-center">
                <Text className="text-xs font-semibold text-zinc-400 text-center max-w-xs leading-relaxed">
                  Data grafik harian akan terbentuk otomatis setelah kamu berlatih di minimal 3 hari dalam sepekan.
                </Text>
              </View>
            ) : (
              <View className="items-center pt-2 pb-1 -ml-4">
                <BarChart
                  data={weeklyChartData}
                  barWidth={22}
                  height={150}
                  spacing={dynamicBarSpacing}
                  roundedTop
                  roundedBottom
                  hideRules
                  xAxisThickness={1}
                  xAxisColor="rgba(255, 255, 255, 0.08)"
                  xAxisLabelTextStyle={{ color: "#A3A3A3", fontSize: 11, fontWeight: "600" }}
                  yAxisThickness={0}
                  yAxisTextStyle={{ color: "#71717A", fontSize: 9 }}
                  noOfSections={3}
                  maxValue={chartMaxWeekly}
                  isAnimated
                  animationDuration={400}
                />
              </View>
            )}

            {/* Clean Sub-metrics Divider */}
            <View className="pt-4 mt-3 border-t border-white/[0.06] gap-2.5">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-zinc-400 font-medium">Latihan Terbanyak</Text>
                <Text className="text-xs font-bold text-[#C7FF41]">
                  {mostFrequentWorkout ? `${mostFrequentWorkout.name} (${mostFrequentWorkout.count}x)` : "Belum ada"}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-zinc-400 font-medium">Otot Paling Sering Dilatih</Text>
                <Text className="text-xs font-bold text-white">
                  {dominantMuscle ? `${dominantMuscle.name} (${dominantMuscle.percentage}%)` : "Belum terdata"}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* 4. Muscle Distribution Card */}
        <Animated.View entering={SECTION_ENTER_4}>
          <View
            style={{ marginBottom: 24 }}
            className="p-5 rounded-3xl bg-[#121212] border border-white/[0.08]"
          >
            <Text className="text-sm font-bold text-white tracking-tight mb-1">
              Distribusi Kelompok Otot
            </Text>
            <Text className="text-xs text-zinc-400 mb-4">
              Pembagian akumulasi beban angkatan
            </Text>

            {summary.muscleDistribution.length === 0 ? (
              <EmptyState
                icon={<Ionicons name="barbell-outline" size={28} color="#71717A" />}
                title="Belum Ada Distribusi Otot"
                message="Data beban per kelompok otot akan terpetakan setelah sesi latihan disimpan."
              />
            ) : (
              summary.muscleDistribution.slice(0, 6).map((item, idx) => (
                <View key={item.muscle || idx} className="mb-3.5">
                  <View className="flex-row justify-between items-center mb-1.5">
                    <Text className="text-xs font-semibold text-white">
                      {item.muscle}
                    </Text>
                    <Text className="text-xs font-bold text-[#C7FF41]">
                      {item.percentage}% ({item.volume.toLocaleString("id-ID")} kg)
                    </Text>
                  </View>
                  <View className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden">
                    <View
                      className="h-full bg-[#C7FF41] rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </View>
                </View>
              ))
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

