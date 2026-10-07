import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useExerciseStore } from "@/stores/exerciseStore";
import { ExerciseCard } from "@/features/exercises/components/ExerciseCard";
import { MuscleChipList } from "@/features/exercises/components/MuscleChipList";
import { EmptyState } from "@/components/ui/EmptyState";
import { Exercise } from "@/types/exercise";
import { Button } from "@/components/ui/Button";
import { AppModal } from "@/components/ui/AppModal";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";

export default function ExercisesScreen() {
  const router = useRouter();
  const {
    filteredExercises,
    searchQuery,
    selectedMuscle,
    isLoading,
    fetchExercises,
    setSearchQuery,
    setSelectedMuscle,
    resetFilters,
  } = useExerciseStore();

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* 1. Unified PageHeader */}
      <PageHeader
        title="Exercise Library"
        subtitle="Katalog Gerakan Latihan"
        fallbackRoute="/(tabs)/home"
      />

      {/* HERO SEARCH BAR */}
      <View className="px-5 my-3">
        <Input
          placeholder="Cari gerakan (cth: Bench Press, Squat)..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          leftIcon={<Ionicons name="search-outline" size={18} color="#71717A" />}
          containerClassName="mb-0"
          suffix={
            searchQuery ? (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                className="w-8 h-8 rounded-full bg-white/[0.06] items-center justify-center -mr-1 active:bg-white/[0.12]"
                accessibilityLabel="Hapus pencarian"
              >
                <Ionicons name="close-circle" size={16} color="#A1A1AA" />
              </TouchableOpacity>
            ) : null
          }
        />
      </View>

      {/* Muscle Group Horizontal Chips */}
      <MuscleChipList
        selectedMuscle={selectedMuscle}
        onSelectMuscle={setSelectedMuscle}
      />

      {/* Content Area */}
      <View className="flex-1 px-5 pt-2">
        {isLoading ? (
          /* Skeleton Loading Cards */
          <View className="gap-3 pt-2">
            {[1, 2, 3, 4, 5].map((idx) => (
              <View
                key={idx}
                className="bg-surface border border-border/60 rounded-[20px] p-4 h-20 flex-row items-center animate-pulse"
              >
                <View className="w-12 h-12 rounded-2xl bg-zinc-800 mr-3.5" />
                <View className="flex-1 gap-2">
                  <View className="w-3/4 h-4 bg-zinc-800 rounded-md" />
                  <View className="w-1/3 h-3 bg-zinc-800/80 rounded-md" />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ExerciseCard
                exercise={item}
                onPress={() => setSelectedExercise(item)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 32,
              flexGrow: 1,
            }}
            ListEmptyComponent={
              <EmptyState
                title="Latihan Tidak Ditemukan"
                message="Tidak ada gerakan yang cocok dengan kata kunci atau filter kelompok otot yang Anda pilih."
                actionLabel="Reset Filter & Pencarian"
                onAction={resetFilters}
              />
            }
            ListHeaderComponent={
              filteredExercises.length > 0 ? (
                <View className="flex-row items-center justify-between mb-3 px-1">
                  <Text className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
                    Daftar Gerakan
                  </Text>
                  <Text className="text-xs text-primary font-bold">
                    {filteredExercises.length} ditemukan
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </View>

      {/* Exercise Detail Modal with AppModal */}
      <AppModal
        visible={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        presentation="center"
        title={selectedExercise?.name}
      >
        <View className="flex-row items-center flex-wrap gap-1.5 mb-4">
          <View className="bg-primary/20 px-2.5 py-0.5 rounded-md">
            <Text className="text-primary text-xs font-bold">
              {selectedExercise?.primary_muscle}
            </Text>
          </View>
          <View className="bg-zinc-800 px-2.5 py-0.5 rounded-md">
            <Text className="text-text-secondary text-xs font-medium">
              {selectedExercise?.equipment}
            </Text>
          </View>
          {selectedExercise?.secondary_muscle ? (
            <View className="bg-zinc-800/60 px-2 py-0.5 rounded-md">
              <Text className="text-zinc-400 text-xs">
                +{selectedExercise?.secondary_muscle}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="my-1 h-[1px] bg-border" />

        <Text className="text-xs font-bold uppercase tracking-wider text-text-secondary my-2">
          Deskripsi & Panduan Eksekusi
        </Text>
        <Text className="text-sm text-white leading-relaxed mb-6">
          {selectedExercise?.description || "Tidak ada deskripsi tambahan."}
        </Text>

        <Button
          label="Tutup Panduan"
          variant="secondary"
          size="md"
          onPress={() => setSelectedExercise(null)}
        />
      </AppModal>
    </SafeAreaView>
  );
}
