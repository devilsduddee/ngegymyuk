import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useWorkoutStore } from "@/stores/workoutStore";
import { ExercisePickerModal } from "@/features/workouts/components/ExercisePickerModal";
import { ConfigureExerciseModal } from "@/features/workouts/components/ConfigureExerciseModal";
import { ConfirmModal, ConfirmModalVariant } from "@/components/ui/ConfirmModal";
import { WorkoutTemplateExercise } from "@/types/workout";
import { Exercise } from "@/types/exercise";
import { useActiveWorkoutStore } from "@/stores/activeWorkoutStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Ionicons } from "@expo/vector-icons";

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const {
    activeTemplate,
    activeExercises,
    isLoading,
    fetchTemplateDetail,
    addExerciseToTemplate,
    updateExerciseConfig,
    removeExerciseFromTemplate,
    moveExercise,
    deleteTemplate,
  } = useWorkoutStore();

  const [pickerVisible, setPickerVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkoutTemplateExercise | null>(null);

  // Custom ConfirmModal state
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
    if (id) {
      fetchTemplateDetail(id);
    }
  }, [id, fetchTemplateDetail]);

  const handleSelectExercise = async (
    exercise: Exercise,
    targetSets: number,
    targetReps: number,
    restTimerSeconds: number
  ) => {
    if (!id) return;

    // Check if exercise already exists in activeExercises
    const alreadyExists = activeExercises.some(
      (item) => item.exercise_id === exercise.id || item.exercise?.name.toLowerCase() === exercise.name.toLowerCase()
    );

    if (alreadyExists) {
      setConfirmModal({
        visible: true,
        title: "Latihan Sudah Ada",
        message: `Latihan "${exercise.name}" sudah ada dalam program ini. Apakah Anda ingin menambahkannya lagi?`,
        confirmText: "Tambahkan Lagi",
        cancelText: "Batal",
        variant: "warning",
        onConfirm: async () => {
          setConfirmModal((prev) => ({ ...prev, visible: false }));
          await addExerciseToTemplate(id, exercise.id, targetSets, targetReps, restTimerSeconds, exercise);
        },
      });
      return;
    }

    await addExerciseToTemplate(id, exercise.id, targetSets, targetReps, restTimerSeconds, exercise);
  };

  const handleSaveConfig = async (sets: number, reps: number, restSeconds: number) => {
    if (!editingItem) return;
    await updateExerciseConfig(editingItem.id, {
      target_sets: sets,
      target_reps: reps,
      rest_timer_seconds: restSeconds,
    });
  };

  const handleDeleteExercise = (exerciseTemplateId: string, exerciseName: string) => {
    console.log("DELETE_BUTTON_PRESSED", { exerciseTemplateId, exerciseName });

    setConfirmModal({
      visible: true,
      title: "Hapus Latihan",
      message: `Hapus "${exerciseName}" dari workout ini?`,
      confirmText: "Hapus",
      cancelText: "Batal",
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, visible: false }));
        await removeExerciseFromTemplate(exerciseTemplateId);
      },
    });
  };

  const handleDeleteEntireTemplate = () => {
    if (!id || !activeTemplate) return;
    setConfirmModal({
      visible: true,
      title: "Hapus Workout",
      message: `Apakah Anda yakin ingin menghapus seluruh template "${activeTemplate.name}"?`,
      confirmText: "Hapus Workout",
      cancelText: "Batal",
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, visible: false }));
        await deleteTemplate(id);
        router.back();
      },
    });
  };

  const handleStartWorkout = async () => {
    console.log("START_WORKOUT_PRESSED", {
      hasTemplate: !!activeTemplate,
      templateName: activeTemplate?.name,
      exercisesCount: activeExercises.length,
    });

    if (!activeTemplate || activeExercises.length === 0) {
      setConfirmModal({
        visible: true,
        title: "Latihan Kosong",
        message: "Tambahkan minimal 1 latihan sebelum memulai sesi.",
        confirmText: "Mengerti",
        cancelText: "Tutup",
        variant: "warning",
        onConfirm: () => {
          setConfirmModal((prev) => ({ ...prev, visible: false }));
        },
      });
      return;
    }

    try {
      console.log("Calling startWorkoutFromTemplate...");
      const started = await useActiveWorkoutStore
        .getState()
        .startWorkoutFromTemplate(activeTemplate, activeExercises);

      console.log("startWorkoutFromTemplate result:", started);

      if (started) {
        console.log("Navigating to /workout/active...");
        router.push("/workout/active");
      } else {
        console.warn("startWorkoutFromTemplate returned false!");
      }
    } catch (err) {
      console.error("Error in handleStartWorkout:", err);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Top Header Navigation with PageHeader */}
      <PageHeader
        title={activeTemplate?.name || "Detail Workout"}
        subtitle="Template Latihan"
        fallbackRoute="/(tabs)/workout"
        rightAction={
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleStartWorkout}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="h-9 px-3.5 rounded-full bg-[#C7FF41] items-center justify-center flex-row gap-1"
          >
            <Ionicons name="play" size={13} color="#080808" />
            <Text className="text-[#080808] text-xs font-black uppercase tracking-wide">
              Mulai
            </Text>
          </TouchableOpacity>
        }
      />

      {/* Subheader / Summary */}
      <View className="px-6 py-3 bg-surface/50 border-b border-border/40 flex-row justify-between items-center">
        <Text className="text-xs text-text-secondary">
          {activeExercises.length} Latihan
        </Text>
        <TouchableOpacity activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={handleDeleteEntireTemplate}>
          <Text className="text-status-error text-xs font-semibold">Hapus Template</Text>
        </TouchableOpacity>
      </View>

      {/* Exercises List */}
      <View className="flex-1 px-6 pt-3">
        {isLoading && activeExercises.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#C7FF41" />
            <Text className="text-text-secondary text-xs font-semibold mt-3">
              Memuat daftar latihan...
            </Text>
          </View>
        ) : (
          <FlatList
            data={activeExercises}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 140 }}
            renderItem={({ item, index }) => (
              <View className="bg-[#121212] rounded-2xl p-4 mb-3 border border-white/[0.08]">
                {/* Top Row: Exercise Name, Muscle, and Compact Reorder Controls */}
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-2">
                    <Text className="text-white text-lg font-bold tracking-tight" numberOfLines={1}>
                      {item.exercise?.name || "Latihan"}
                    </Text>
                    <Text className="text-xs text-zinc-400 mt-0.5 font-medium">
                      {item.exercise?.primary_muscle && item.exercise?.equipment
                        ? `${item.exercise.primary_muscle} • ${item.exercise.equipment}`
                        : item.exercise?.primary_muscle || item.exercise?.equipment || "Umum"}
                    </Text>
                  </View>

                  {/* Compact Minimal Reorder Arrows */}
                  <View className="flex-row items-center gap-1">
                    <TouchableOpacity
                      disabled={index === 0}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                      onPress={() => moveExercise(index, "up")}
                      className={`w-7 h-7 items-center justify-center rounded-lg bg-white/[0.04] ${
                        index === 0 ? "opacity-20" : "active:bg-white/[0.10]"
                      }`}
                    >
                      <Ionicons name="chevron-up" size={15} color="#FFFFFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      disabled={index === activeExercises.length - 1}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                      onPress={() => moveExercise(index, "down")}
                      className={`w-7 h-7 items-center justify-center rounded-lg bg-white/[0.04] ${
                        index === activeExercises.length - 1 ? "opacity-20" : "active:bg-white/[0.10]"
                      }`}
                    >
                      <Ionicons name="chevron-down" size={15} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Inline Target Specs (Direct on Surface, No Box-in-Box) */}
                <View className="flex-row items-center justify-between py-3 my-1 border-t border-b border-white/[0.06]">
                  <View className="flex-row items-baseline">
                    <Text className="text-xl font-black text-white">
                      {item.target_sets}
                    </Text>
                    <Text className="text-zinc-500 text-sm font-bold mx-1.5">
                      ×
                    </Text>
                    <Text className="text-xl font-black text-white">
                      {item.target_reps}
                    </Text>
                    <Text className="text-xs text-zinc-400 font-medium ml-1.5">
                      reps
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-1">
                    <Ionicons name="timer-outline" size={14} color="#C7FF41" />
                    <Text className="text-xs font-bold text-[#C7FF41]">
                      {item.rest_timer_seconds}s istirahat
                    </Text>
                  </View>
                </View>

                {/* Item Footer Quick Actions (Clean text buttons) */}
                <View className="flex-row justify-end items-center gap-3 pt-1">
                  <TouchableOpacity
                    onPress={() => setEditingItem(item)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text className="text-xs font-semibold text-zinc-300">
                      Ubah Target
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      handleDeleteExercise(item.id, item.exercise?.name || "Latihan")
                    }
                    activeOpacity={0.7}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text className="text-xs font-semibold text-red-400">
                      Hapus
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <EmptyState
                icon="💪"
                title="Belum Ada Latihan"
                message="Tambahkan latihan ke template ini."
                actionLabel="+ Tambah Latihan"
                onAction={() => setPickerVisible(true)}
              />
            }
          />
        )}
      </View>

      {/* Add Exercise CTA Button */}
      <View className="absolute bottom-6 left-6 right-6 z-20" style={{ pointerEvents: "box-none" }}>
        <Button
          label="+ Tambah Latihan"
          variant="primary"
          onPress={() => setPickerVisible(true)}
          className="shadow-lg"
        />
      </View>

      {/* Exercise Picker Modal */}
      <ExercisePickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelectExercise={handleSelectExercise}
      />

      {/* Configure Target Modal */}
      <ConfigureExerciseModal
        visible={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveConfig}
      />

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
