import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
  FadeIn,
  FadeOut,
  Easing,
} from "react-native-reanimated";
import { useActiveWorkoutStore } from "@/stores/activeWorkoutStore";
import { prService } from "@/features/history/services/prService";
import { ConfirmModal, ConfirmModalVariant } from "@/components/ui/ConfirmModal";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/Button";

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const SET_ROW_ENTER = FadeInDown.duration(200).easing(EASE_OUT);
const PR_BADGE_ENTER = FadeInDown.duration(250).easing(EASE_OUT);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);


export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const {
    activeSession,
    exercises,
    currentExerciseIndex,
    loggedSets,
    elapsedSeconds,
    tickWorkoutTimer,
    tickRestTimer,
    restTimer,
    isRestCompleted,
    dismissRestCompleted,
    pauseRestTimer,
    resumeRestTimer,
    skipRestTimer,
    startRestTimer,
    completeSet,
    activePR,
    dismissPR,
    nextExercise,
    prevExercise,
    finishWorkout,
    discardWorkout,
    resetActiveWorkout,
    lastSummary,
    isLoggingSet,
  } = useActiveWorkoutStore();

  const [weight, setWeight] = useState("60");
  const [reps, setReps] = useState("8");
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [lastSessionSet, setLastSessionSet] = useState<{
    weight: number;
    reps: number;
  } | null>(null);

  // Reusable ConfirmModal State
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: ConfirmModalVariant;
    onConfirm: () => void | Promise<void>;
  }>({
    visible: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    console.log("[ACTIVE_SCREEN_MOUNT]", {
      hasActiveSession: !!activeSession,
      sessionId: activeSession?.id,
      exerciseCount: exercises.length,
    });

    if (activeSession) {
      console.log("[ACTIVE_SESSION_FOUND]", {
        sessionId: activeSession.id,
        workoutName: activeSession.workout_name,
      });
    } else {
      console.warn("[ACTIVE_SESSION_NOT_FOUND] activeSession is null or exercises array is empty");
    }
  }, [activeSession, exercises]);

  useEffect(() => {
    const timer = setInterval(() => {
      tickWorkoutTimer();
      tickRestTimer();
    }, 1000);
    return () => clearInterval(timer);
  }, [tickWorkoutTimer, tickRestTimer]);

  const currentExerciseItem = exercises[currentExerciseIndex];
  const currentExercise = currentExerciseItem?.exercise;

  // Fetch previous performance for active exercise
  const loadPreviousPerformance = useCallback(async (exerciseId: string) => {
    try {
      const history = await prService.getExerciseProgress(exerciseId);
      if (history && history.length > 0) {
        setLastSessionSet({
          weight: history[0].weight,
          reps: history[0].reps,
        });
      } else {
        setLastSessionSet(null);
      }
    } catch {
      setLastSessionSet(null);
    }
  }, []);

  useEffect(() => {
    if (currentExerciseItem?.exercise_id) {
      loadPreviousPerformance(currentExerciseItem.exercise_id);
    }
  }, [currentExerciseItem?.exercise_id, loadPreviousPerformance]);

  // PR Celebration Haptic Trigger (Immediate on first frame)
  useEffect(() => {
    if (activePR) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [activePR]);

  // Session Completed Haptic Trigger
  useEffect(() => {
    if (summaryVisible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [summaryVisible]);

  if (!activeSession || exercises.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center px-6">
        <Text className="text-white text-xl font-bold mb-3">Tidak Ada Sesi Latihan Aktif</Text>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/workout")}
          className="px-6 py-3 bg-primary rounded-xl"
        >
          <Text className="text-white font-bold">Kembali ke Workout</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
    }
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const formatRest = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const currentExerciseSets = loggedSets.filter(
    (s) => s.exercise_id === currentExerciseItem.exercise_id
  );

  const nextSetNumber = currentExerciseSets.length + 1;

  const handleCompleteSet = async () => {
    // Signature Moment: The Heavy Click
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const rawWeight = parseFloat(weight) || 0;
    const rawReps = parseInt(reps, 10) || 0;
    const clampedWeight = Math.min(Math.max(rawWeight, 1), 1000);
    const clampedReps = Math.min(Math.max(rawReps, 1), 100);

    setWeight(String(clampedWeight));
    setReps(String(clampedReps));

    await completeSet(clampedWeight, clampedReps);
  };

  const handleFinishPrompt = () => {
    setConfirmModal({
      visible: true,
      title: "Selesai Latihan",
      message: "Simpan seluruh set dan selesaikan sesi hari ini?",
      confirmText: "Simpan Latihan",
      cancelText: "Kembali",
      variant: "default",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, visible: false }));
        const summary = await finishWorkout();
        if (summary) setSummaryVisible(true);
      },
    });
  };

  const handleDiscardPrompt = () => {
    setConfirmModal({
      visible: true,
      title: "Hapus Sesi Latihan",
      message: "Semua set yang baru dicatat akan dihapus. Yakin?",
      confirmText: "Hapus",
      cancelText: "Lanjutkan",
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, visible: false }));
        await discardWorkout();
        router.replace("/(tabs)/workout");
      },
    });
  };

  const adjustWeight = (delta: number) => {
    const current = parseFloat(weight) || 0;
    const updated = Math.min(Math.max(1, current + delta), 1000);
    setWeight(String(updated));
  };

  const adjustReps = (delta: number) => {
    const current = parseInt(reps, 10) || 0;
    const updated = Math.min(Math.max(1, current + delta), 100);
    setReps(String(updated));
  };


  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>

      {/* 1. Top Bar with Integrated Stopwatch & Rest Timer (Zero Layout Shift) */}
      <View className="px-5 py-3 border-b border-white/[0.08] bg-[#080808]">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleDiscardPrompt}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="min-h-[44px] justify-center pr-3"
          >
            <Text className="text-text-secondary text-sm font-medium">Batal</Text>
          </TouchableOpacity>

          {/* Central Timer: Workout Duration, Active Rest Countdown, or Rest Selesai */}
          <View className="items-center">
            <Text className="text-text-secondary text-xs font-medium" numberOfLines={1}>
              {isRestCompleted
                ? "Waktu Istirahat Selesai"
                : restTimer.isActive
                ? "Istirahat"
                : activeSession.workout_name}
            </Text>
            {isRestCompleted ? (
              <Animated.Text
                entering={FadeIn.duration(150)}
                exiting={FadeOut.duration(200)}
                className="text-lg font-bold tracking-wider mt-0.5 text-[#C7FF41]"
              >
                REST SELESAI
              </Animated.Text>
            ) : (
              <Text
                className={`text-lg font-mono font-bold tracking-wider mt-0.5 ${
                  restTimer.isActive ? "text-[#C7FF41]" : "text-white"
                }`}
              >
                {restTimer.isActive
                  ? formatRest(restTimer.remainingSeconds)
                  : formatTimer(elapsedSeconds)}
              </Text>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleFinishPrompt}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="min-h-[44px] justify-center pl-3"
          >
            <Text className="text-[#C7FF41] text-sm font-bold">Selesai</Text>
          </TouchableOpacity>
        </View>

        {/* Visual Rest Selesai Banner (for ~2 seconds) */}
        {isRestCompleted ? (
          <Animated.View
            entering={FadeInDown.duration(200)}
            exiting={FadeOut.duration(200)}
            className="flex-row items-center justify-center gap-2 py-2 mt-2 bg-[#C7FF41]/15 border border-[#C7FF41]/40 rounded-xl"
          >
            <Text className="text-[#C7FF41] text-xs font-black tracking-wider uppercase">
              ⚡ Istirahat Selesai • Mulai Set Berikutnya
            </Text>
          </Animated.View>
        ) : null}

        {/* Integrated Rest Action Controls (Seamlessly docked in Header without pushing content) */}
        {restTimer.isActive ? (
          <Animated.View
            entering={FadeIn.duration(150)}
            className="flex-row items-center justify-center gap-2 pt-2.5 mt-2 border-t border-border/40"
          >
            <TouchableOpacity
              onPress={() => startRestTimer(restTimer.remainingSeconds + 30)}
              className="px-3 py-1.5 rounded-lg bg-surface border border-border"
            >
              <Text className="text-text-primary text-xs font-semibold">+30d</Text>
            </TouchableOpacity>

            {restTimer.isPaused ? (
              <TouchableOpacity
                onPress={resumeRestTimer}
                className="px-3 py-1.5 rounded-lg bg-surface border border-border"
              >
                <Text className="text-white text-xs font-semibold">Lanjut</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={pauseRestTimer}
                className="px-3 py-1.5 rounded-lg bg-surface border border-border"
              >
                <Text className="text-text-secondary text-xs font-semibold">Jeda</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={skipRestTimer}
              className="px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30"
            >
              <Text className="text-red-400 text-xs font-semibold">Lewati</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : null}
      </View>


      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Compact Exercise Navigation Bar & Category */}
        <View className="pt-4 pb-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5 bg-surface px-2.5 py-1 rounded-full border border-border">
            <TouchableOpacity
              disabled={currentExerciseIndex === 0}
              onPress={prevExercise}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className={`px-1 ${currentExerciseIndex === 0 ? "opacity-30" : "active:opacity-60"}`}
            >
              <Text className="text-white text-xs font-bold">‹</Text>
            </TouchableOpacity>

            <Text className="text-white text-xs font-semibold px-1">
              Latihan {currentExerciseIndex + 1} / {exercises.length}
            </Text>

            <TouchableOpacity
              disabled={currentExerciseIndex === exercises.length - 1}
              onPress={nextExercise}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className={`px-1 ${
                currentExerciseIndex === exercises.length - 1 ? "opacity-30" : "active:opacity-60"
              }`}
            >
              <Text className="text-white text-xs font-bold">›</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-text-secondary text-xs font-medium">
            {currentExercise?.primary_muscle || "Umum"} • {currentExercise?.equipment || "Alat"}
          </Text>
        </View>

        {/* 3. Active Exercise Name & Performance Anchors (L1 & L2) */}
        <View className="pb-4">
          <Text className="text-white text-2xl font-bold tracking-tight" numberOfLines={2}>
            {currentExercise?.name || "Latihan"}
          </Text>

          {/* Last Session Performance Anchor */}
          <View className="flex-row items-center gap-2 mt-1.5">
            <View className="bg-surface border border-border px-2.5 py-1 rounded-lg flex-row items-center gap-1.5">
              <Text className="text-text-secondary text-[11px] font-medium">Sesi Terakhir:</Text>
              <Text className="text-white text-[11px] font-bold">
                {lastSessionSet
                  ? `${lastSessionSet.weight} kg × ${lastSessionSet.reps} reps`
                  : "Belum ada log"}
              </Text>
            </View>

            <Text className="text-text-secondary text-[11px]">
              Target: {currentExerciseItem.target_sets} Set × {currentExerciseItem.target_reps} Reps
            </Text>
          </View>
        </View>

        {/* 4. Active Set Controller (Hevy / Strong Unified Native Surface) */}
        <View className="bg-[#121212] rounded-2xl p-5 border border-white/[0.08] mb-5">
          {/* Header Row: Set Number & Live Volume Calculation */}
          <View className="flex-row items-center justify-between pb-4 border-b border-white/[0.06]">
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-[#C7FF41]" />
              <Text className="text-white text-sm font-bold tracking-tight">
                Set {nextSetNumber} dari {currentExerciseItem.target_sets}
              </Text>
            </View>
            <Text className="text-xs font-semibold text-zinc-400">
              Volume: {((parseFloat(weight) || 0) * (parseInt(reps, 10) || 0)).toFixed(0)} kg
            </Text>
          </View>

          {/* Unified Dual Column Input (Direct on Surface, No Nested Box-in-Box) */}
          <View className="flex-row items-center justify-around py-5">
            {/* Weight Input Column */}
            <View className="items-center flex-1">
              <Text className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1">
                Beban
              </Text>
              <View className="flex-row items-baseline justify-center">
                <TextInput
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                  cursorColor="#C7FF41"
                  selectionColor="rgba(199, 255, 65, 0.3)"
                  className="text-white text-4xl font-black text-center p-0 min-w-[70px]"
                />
                <Text className="text-zinc-500 text-sm font-semibold ml-1">kg</Text>
              </View>
            </View>

            {/* Subtle Vertical Divider */}
            <View className="w-[1px] h-12 bg-white/[0.08]" />

            {/* Reps Input Column */}
            <View className="items-center flex-1">
              <Text className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1">
                Repetisi
              </Text>
              <View className="flex-row items-baseline justify-center">
                <TextInput
                  keyboardType="numeric"
                  value={reps}
                  onChangeText={setReps}
                  cursorColor="#C7FF41"
                  selectionColor="rgba(199, 255, 65, 0.3)"
                  className="text-white text-4xl font-black text-center p-0 min-w-[50px]"
                />
                <Text className="text-zinc-500 text-sm font-semibold ml-1">reps</Text>
              </View>
            </View>
          </View>

          {/* Integrated Stepper Controls (One-Hand Gym Friendly) */}
          <View className="pt-3 border-t border-white/[0.06] gap-2.5">
            {/* Weight Steppers */}
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  adjustWeight(-5);
                }}
                className="flex-1 h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] items-center justify-center active:bg-white/[0.08]"
              >
                <Text className="text-zinc-300 font-semibold text-xs">-5 kg</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  adjustWeight(-2.5);
                }}
                className="flex-1 h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] items-center justify-center active:bg-white/[0.08]"
              >
                <Text className="text-zinc-300 font-semibold text-xs">-2.5</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  adjustWeight(2.5);
                }}
                className="flex-1 h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] items-center justify-center active:bg-white/[0.08]"
              >
                <Text className="text-[#C7FF41] font-bold text-xs">+2.5</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  adjustWeight(5);
                }}
                className="flex-1 h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] items-center justify-center active:bg-white/[0.08]"
              >
                <Text className="text-[#C7FF41] font-bold text-xs">+5 kg</Text>
              </TouchableOpacity>
            </View>

            {/* Reps Steppers */}
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  adjustReps(-1);
                }}
                className="flex-1 h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] items-center justify-center active:bg-white/[0.08]"
              >
                <Text className="text-zinc-300 font-semibold text-xs">-1 Rep</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  adjustReps(1);
                }}
                className="flex-1 h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] items-center justify-center active:bg-white/[0.08]"
              >
                <Text className="text-[#C7FF41] font-bold text-xs">+1 Rep</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 5. Set Table (Hevy / Strong Clean Table Format) */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between pb-2 mb-2">
            <Text className="text-white text-sm font-bold tracking-tight">
              Set Selesai
            </Text>
            <Text className="text-xs text-text-secondary">
              {currentExerciseSets.length} Set
            </Text>
          </View>

          {currentExerciseSets.length === 0 ? (
            <View className="bg-surface rounded-2xl p-4 border border-white/[0.08] items-center justify-center py-5">
              <Text className="text-text-secondary text-xs text-center">
                Belum ada set dicatat. Simpan set pertama di bawah.
              </Text>
            </View>
          ) : (
            <View className="bg-surface rounded-2xl p-3 border border-white/[0.08]">
              {currentExerciseSets.map((s, idx) => (
                <Animated.View
                  key={s.id}
                  entering={SET_ROW_ENTER}
                  className={`flex-row items-center justify-between py-2.5 px-2 ${
                    idx < currentExerciseSets.length - 1 ? "border-b border-white/[0.08]" : ""
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-6 h-6 rounded-full bg-[#C7FF41]/15 items-center justify-center">
                      <Text className="text-[#C7FF41] text-xs font-bold">{s.set_number}</Text>
                    </View>
                    <Text className="text-white text-sm font-semibold">
                      {s.weight} kg × {s.reps} reps
                    </Text>
                  </View>
                  <Text className="text-text-secondary text-xs font-medium">
                    {s.volume} kg
                  </Text>
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 7. Action Button Terbesar (DESIGN.md Complete Set Button) */}
      <View className="absolute bottom-5 left-5 right-5" style={{ pointerEvents: "box-none" }}>
        <TouchableOpacity
          onPress={handleCompleteSet}
          disabled={isLoggingSet}
          activeOpacity={0.88}
          className={`h-16 rounded-[18px] bg-[#C7FF41] items-center justify-center shadow-xl shadow-lime-950/40 ${
            isLoggingSet ? "opacity-60" : ""
          }`}
        >
          <Text className="text-[#080808] text-base font-black tracking-wider uppercase">
            {isLoggingSet
              ? "Menyimpan Set..."
              : `Simpan Set • ${weight} kg × ${reps} reps`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 8. Personal Record Banner / Modal (DESIGN.md Lime Glow PR) */}
      <AppModal
        visible={!!activePR}
        onClose={dismissPR}
        showCloseButton={false}
        presentation="center"
        className="items-center"
      >
        <Animated.View entering={PR_BADGE_ENTER} className="w-full items-center">
          <View className="w-14 h-14 rounded-full bg-[#C7FF41]/20 border border-[#C7FF41]/40 items-center justify-center mb-3 self-center shadow-lg shadow-lime-950/50">
            <Text className="text-[#C7FF41] text-xl font-black">PR</Text>
          </View>

          <Text className="text-white text-2xl font-black text-center mb-1 tracking-tight">
            Rekor Baru (PR)
          </Text>

          <Text className="text-text-secondary text-sm text-center mb-4">
            {activePR?.exerciseName}
          </Text>

          <View className="bg-background rounded-[20px] px-6 py-4 border border-white/[0.08] my-1 items-center w-full">
            <Text className="text-4xl font-black text-[#C7FF41]">
              {activePR?.newWeight} kg
            </Text>
            <Text className="text-xs text-[#C7FF41] font-bold mt-1">
              +{((activePR?.newWeight || 0) - (activePR?.previousWeight || 0)).toFixed(1)} kg lebih berat dari sebelumnya
            </Text>
          </View>

          <Button
            label="Lanjutkan Latihan"
            onPress={dismissPR}
            className="w-full mt-5"
          />
        </Animated.View>
      </AppModal>

      {/* 9. Ringkasan Selesai Latihan (Apple Fitness & Hevy Inspired Polish) */}
      <AppModal
        visible={summaryVisible}
        onClose={() => {
          setSummaryVisible(false);
          resetActiveWorkout();
          router.replace("/(tabs)/home");
        }}
        showCloseButton={false}
        presentation="center"
        contentStyle={{
          backgroundColor: "#121212",
          borderRadius: 28,
          padding: 22,
          maxWidth: 360,
          alignSelf: "center",
        }}
      >
        <Animated.View entering={PR_BADGE_ENTER} className="w-full items-center">
          {/* Achievement Icon Badge */}
          <View className="w-11 h-11 rounded-full bg-[#C7FF41]/15 border border-[#C7FF41]/30 items-center justify-center mb-2.5">
            <Text className="text-[#C7FF41] text-base font-black">✓</Text>
          </View>

          {/* Title & Subtitle */}
          <Text className="text-xl font-bold text-white text-center tracking-tight">
            Latihan Selesai
          </Text>
          <Text className="text-xs text-zinc-400 text-center mt-0.5 mb-4">
            Sesi berhasil disimpan ke riwayat
          </Text>

          {/* Compact PR Pill (Only if PR exists) */}
          {lastSummary?.newPRs && lastSummary.newPRs.length > 0 ? (
            <View className="flex-row items-center gap-1.5 px-3 py-1.5 bg-[#C7FF41]/10 border border-[#C7FF41]/25 rounded-full mb-4 self-center">
              <Text className="text-xs">🔥</Text>
              <Text className="text-[#C7FF41] text-[11px] font-bold tracking-wide uppercase">
                {lastSummary.newPRs.length} Rekor Baru
              </Text>
            </View>
          ) : null}

          {/* Clean 3-Column Performance Metrics (Apple Fitness / Hevy style) */}
          <View className="w-full flex-row items-center justify-between py-3.5 px-2 bg-white/[0.03] rounded-2xl border border-white/[0.06] mb-5">
            {/* Durasi */}
            <View className="flex-1 items-center">
              <Text className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider mb-1">
                Waktu
              </Text>
              <Text className="text-base font-bold text-white font-mono">
                {formatTimer(lastSummary?.durationSeconds || elapsedSeconds)}
              </Text>
            </View>

            <View className="w-[1px] h-6 bg-white/[0.08]" />

            {/* Total Set */}
            <View className="flex-1 items-center">
              <Text className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider mb-1">
                Total Set
              </Text>
              <Text className="text-base font-bold text-white">
                {lastSummary?.totalSets ?? currentExerciseSets.length}
              </Text>
            </View>

            <View className="w-[1px] h-6 bg-white/[0.08]" />

            {/* Total Volume */}
            <View className="flex-1 items-center">
              <Text className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider mb-1">
                Volume
              </Text>
              <Text className="text-base font-black text-[#C7FF41]">
                {lastSummary?.totalVolume ?? 0}
                <Text className="text-[11px] font-normal text-zinc-400"> kg</Text>
              </Text>
            </View>
          </View>

          {/* Calibrated Action CTA */}
          <Button
            label="Simpan & Tutup"
            size="md"
            onPress={() => {
              setSummaryVisible(false);
              resetActiveWorkout();
              router.replace("/(tabs)/home");
            }}
            className="w-full h-12 rounded-[14px]"
          />
        </Animated.View>
      </AppModal>


      {/* Reusable Dark Confirm Modal */}
      <ConfirmModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}
