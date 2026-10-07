import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Keyboard,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useWorkoutStore } from "@/stores/workoutStore";
import { useActiveWorkoutStore } from "@/stores/activeWorkoutStore";
import { workoutTemplateExerciseService } from "@/features/workouts/services/workoutTemplateExerciseService";
import { TemplateCard } from "@/features/workouts/components/TemplateCard";
import { Button } from "@/components/ui/Button";
import { ConfirmModal, ConfirmModalVariant } from "@/components/ui/ConfirmModal";
import { AppModal } from "@/components/ui/AppModal";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";

import { HeroTemplateCard } from "@/features/workouts/components/HeroTemplateCard";

export default function WorkoutScreen() {
  const router = useRouter();
  const {
    templates,
    isLoading,
    fetchTemplates,
    createTemplate,
    updateTemplateName,
    deleteTemplate,
  } = useWorkoutStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

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

  // Refetch / revalidate on screen focus (e.g. navigating back from Workout Detail)
  useFocusEffect(
    useCallback(() => {
      fetchTemplates();
    }, [fetchTemplates])
  );

  const handleOpenCreate = () => {
    setEditingId(null);
    setTemplateName("");
    setModalVisible(true);
  };

  const handleOpenEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setTemplateName(currentName);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      setConfirmModal({
        visible: true,
        title: "Nama Wajib Diisi",
        message: "Nama template workout tidak boleh kosong.",
        variant: "warning",
        confirmText: "Mengerti",
        onConfirm: () =>
          setConfirmModal((prev) => ({ ...prev, visible: false })),
      });
      return;
    }

    if (editingId) {
      await updateTemplateName(editingId, templateName.trim());
    } else {
      await createTemplate(templateName.trim());
    }

    setModalVisible(false);
    setTemplateName("");
    setEditingId(null);
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmModal({
      visible: true,
      title: "Hapus Template?",
      message: `Apakah Anda yakin ingin menghapus "${name}"? Seluruh daftar latihan di dalamnya akan ikut terhapus.`,
      variant: "danger",
      confirmText: "Hapus",
      cancelText: "Batal",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, visible: false }));
        await deleteTemplate(id);
      },
    });
  };

  const handleStartWorkout = async (template: any) => {
    console.log("[START_WORKOUT_PRESSED]", {
      templateId: template.id,
      templateName: template.name,
      exerciseCount: template.exercise_count,
    });

    try {
      // 1. Fetch exercises for this template to ensure full exercise data is loaded
      const { data: exercises } = await workoutTemplateExerciseService.getTemplateExercises(template.id);
      const exerciseList = exercises || [];

      if (exerciseList.length === 0) {
        setConfirmModal({
          visible: true,
          title: "Template Kosong",
          message: "Template ini belum memiliki latihan. Tambahkan latihan terlebih dahulu sebelum memulai sesi workout.",
          variant: "warning",
          confirmText: "Buka Template",
          cancelText: "Batal",
          onConfirm: () => {
            setConfirmModal((prev) => ({ ...prev, visible: false }));
            router.push({
              pathname: "/workout/[id]",
              params: { id: template.id },
            });
          },
        });
        return;
      }

      // 2. Create session and populate activeWorkoutStore
      const started = await useActiveWorkoutStore
        .getState()
        .startWorkoutFromTemplate(template, exerciseList);

      if (started) {
        const currentActive = useActiveWorkoutStore.getState().activeSession;
        console.log("[SESSION_CREATED]", { sessionId: currentActive?.id });
        console.log("[ACTIVE_STORE_UPDATED]", {
          exerciseCount: useActiveWorkoutStore.getState().exercises.length,
          isTimerRunning: useActiveWorkoutStore.getState().isTimerRunning,
        });

        console.log("[NAVIGATION_START]", "/workout/active");
        router.push("/workout/active");
      } else {
        console.warn("Gagal memulai sesi dari template:", template.name);
      }
    } catch (err) {
      console.error("Error in handleStartWorkout:", err);
    }
  };

  const heroTemplate = templates[0];
  const otherTemplates = templates.slice(1);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Screen Header */}
      <View className="px-5 pt-3 pb-3 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-black text-white tracking-tight">
            Workout
          </Text>
          <Text className="text-xs text-text-secondary mt-0.5 font-medium">
            Template & sesi latihan
          </Text>
        </View>
        <Button
          label="+ Buat"
          size="md"
          variant="secondary"
          onPress={handleOpenCreate}
          style={{ height: 38, paddingHorizontal: 16, borderRadius: 12 }}
        />
      </View>

      {/* Templates Content */}
      <View className="flex-1 px-5 pt-1">
        {isLoading && templates.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#C7FF41" />
            <Text className="text-text-secondary text-xs mt-3 font-semibold">
              Memuat template...
            </Text>
          </View>
        ) : templates.length === 0 ? (
          <EmptyState
            icon={<Ionicons name="barbell-outline" size={32} color="#71717A" />}
            title="Belum Ada Template"
            message="Buat template latihan untuk mulai mencatat beban dan set."
            actionLabel="+ Buat Template"
            onAction={handleOpenCreate}
          />
        ) : (
          <FlatList
            data={otherTemplates}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
            ListHeaderComponent={
              <View>
                {/* 1. Hero Template Card */}
                {heroTemplate && (
                  <HeroTemplateCard
                    template={heroTemplate}
                    onPress={() =>
                      router.push({
                        pathname: "/workout/[id]",
                        params: { id: heroTemplate.id },
                      })
                    }
                    onStartWorkout={() => handleStartWorkout(heroTemplate)}
                    onEdit={() => handleOpenEdit(heroTemplate.id, heroTemplate.name)}
                    onDelete={() => handleDelete(heroTemplate.id, heroTemplate.name)}
                  />
                )}

                {/* 2. Sleek Action Strip: Buat Template Baru */}
                <Pressable
                  onPress={handleOpenCreate}
                  className="flex-row items-center justify-between p-3.5 rounded-2xl bg-[#121212] border border-white/[0.08] mb-4 active:bg-white/[0.04]"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-full bg-[#C7FF41]/10 items-center justify-center">
                      <Ionicons name="add" size={22} color="#C7FF41" />
                    </View>
                    <View>
                      <Text className="text-white text-sm font-bold">
                        Buat Template Baru
                      </Text>
                      <Text className="text-zinc-400 text-xs font-normal">
                        Atur latihan, target set, reps, dan waktu istirahat
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#71717A" />
                </Pressable>

                {/* 3. Section Title for Other Templates */}
                {otherTemplates.length > 0 && (
                  <View className="flex-row items-center justify-between mb-2.5 pt-1">
                    <Text className="text-white text-sm font-bold uppercase tracking-wider">
                      Template Lainnya
                    </Text>
                    <Text className="text-zinc-500 text-xs font-semibold">
                      {otherTemplates.length} Template
                    </Text>
                  </View>
                )}
              </View>
            }
            renderItem={({ item }) => (
              <TemplateCard
                template={item}
                onPress={() =>
                  router.push({
                    pathname: "/workout/[id]",
                    params: { id: item.id },
                  })
                }
                onStartWorkout={() => handleStartWorkout(item)}
                onEdit={() => handleOpenEdit(item.id, item.name)}
                onDelete={() => handleDelete(item.id, item.name)}
              />
            )}
          />
        )}
      </View>

      {/* Create / Edit Template Modal (Lightweight Utility Modal) */}
      <AppModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editingId ? "Ubah Nama Template" : "Buat Template Baru"}
        presentation="center"
      >
        <Input
          placeholder="Contoh: Push Day, Leg Day"
          value={templateName}
          onChangeText={setTemplateName}
          autoFocus
          containerClassName="mb-4"
        />

        <View className="flex-row gap-2.5">
          <View className="flex-1">
            <Button
              label="Batal"
              variant="outline"
              size="md"
              onPress={() => {
                Keyboard.dismiss();
                setModalVisible(false);
              }}
            />
          </View>
          <View className="flex-1">
            <Button
              label="Simpan"
              size="md"
              onPress={() => {
                Keyboard.dismiss();
                handleSave();
              }}
            />
          </View>
        </View>
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
