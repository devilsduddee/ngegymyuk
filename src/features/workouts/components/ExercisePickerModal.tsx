import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Exercise, MuscleGroup } from "@/types/exercise";
import { Ionicons } from "@expo/vector-icons";
import { MuscleChipList } from "@/features/exercises/components/MuscleChipList";
import { exerciseService } from "@/features/exercises/services/exerciseService";
import { useExerciseStore } from "@/stores/exerciseStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AppModal } from "@/components/ui/AppModal";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";

interface ExercisePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (
    exercise: Exercise,
    targetSets: number,
    targetReps: number,
    restTimerSeconds: number
  ) => void;
}

export const ExercisePickerModal: React.FC<ExercisePickerModalProps> = ({
  visible,
  onClose,
  onSelectExercise,
}) => {
  const { exercises, isLoading, fetchExercises } = useExerciseStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup>("All");
  const [configuringExercise, setConfiguringExercise] = useState<Exercise | null>(null);

  // Config fields
  const [targetSets, setTargetSets] = useState("4");
  const [targetReps, setTargetReps] = useState("8");
  const [restTimerSeconds, setRestTimerSeconds] = useState("90");

  useEffect(() => {
    if (visible && exercises.length === 0) {
      fetchExercises();
    }
  }, [visible, exercises.length, fetchExercises]);

  const filteredExercises = exerciseService.filterExercises(
    exercises,
    searchQuery,
    selectedMuscle,
    "All"
  );

  const handlePick = (exercise: Exercise) => {
    setConfiguringExercise(exercise);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedMuscle("All");
  };

  const handleConfirmAdd = () => {
    if (!configuringExercise) return;
    const sets = parseInt(targetSets, 10) || 4;
    const reps = parseInt(targetReps, 10) || 8;
    const rest = parseInt(restTimerSeconds, 10) || 90;

    onSelectExercise(configuringExercise, sets, reps, rest);
    setConfiguringExercise(null);
    onClose();
  };

  return (
    <AppModal
      visible={visible}
      presentation="bottom-sheet"
      title={configuringExercise ? "Target Latihan" : "Pilih Latihan"}
      onClose={() => {
        if (configuringExercise) {
          setConfiguringExercise(null);
        } else {
          onClose();
        }
      }}
      contentStyle={{ height: "90%" }}
      dismissKeyboardOnTap={false}
    >
      {configuringExercise ? (
        /* Configure Step with Keyboard Avoidance */
        <ScrollView
          className="flex-1 px-6 py-4"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Card className="p-4 mb-5">
            <Text className="text-lg font-bold text-white mb-1">
              {configuringExercise.name}
            </Text>
            <Text className="text-xs text-primary font-semibold">
              {configuringExercise.primary_muscle} • {configuringExercise.equipment}
            </Text>
            <Text className="text-xs text-text-secondary mt-2 leading-relaxed">
              {configuringExercise.description}
            </Text>
          </Card>

          <Input
            label="Target Set"
            placeholder="Contoh: 4"
            value={targetSets}
            onChangeText={setTargetSets}
            isNumeric
            containerClassName="mb-3.5"
          />

          <Input
            label="Target Repetisi"
            placeholder="Contoh: 8"
            value={targetReps}
            onChangeText={setTargetReps}
            isNumeric
            containerClassName="mb-3.5"
          />

          <Input
            label="Waktu Istirahat"
            placeholder="Contoh: 90"
            value={restTimerSeconds}
            onChangeText={setRestTimerSeconds}
            isNumeric
            suffix="detik"
            containerClassName="mb-5"
          />

          <Button
            label="Tambahkan Latihan"
            onPress={handleConfirmAdd}
            className="mb-4"
          />
        </ScrollView>
      ) : (
        /* Exercise List Selection Step */
        <View className="flex-1">
          {/* Search Bar */}
          <View className="px-6 pt-3 pb-1">
            <Input
              placeholder="Cari latihan..."
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

          {/* Muscle Filter Chips with Dedicated Non-collapsing Container */}
          <View className="py-1">
            <MuscleChipList
              selectedMuscle={selectedMuscle}
              onSelectMuscle={setSelectedMuscle}
            />
          </View>

          {/* Exercises FlatList */}
          {isLoading && exercises.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color="#C7FF41" />
              <Text className="text-text-secondary text-xs font-semibold mt-3">
                Memuat daftar latihan...
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredExercises}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingTop: 8,
                paddingBottom: 40,
                flexGrow: 1,
              }}
              ListHeaderComponent={
                filteredExercises.length > 0 ? (
                  <View className="flex-row items-center justify-between mb-2.5 px-0.5">
                    <Text className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">
                      Daftar Latihan
                    </Text>
                    <Text className="text-[11px] text-primary font-bold">
                      {filteredExercises.length} Latihan
                    </Text>
                  </View>
                ) : null
              }
              ListEmptyComponent={
                <EmptyState
                  title="Latihan Tidak Ditemukan"
                  message="Tidak ada latihan yang sesuai dengan pencarian."
                  actionLabel="Reset Pencarian"
                  onAction={handleResetFilters}
                />
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handlePick(item)}
                  className="bg-surface border border-border rounded-[20px] p-3.5 mb-2.5 flex-row items-center justify-between"
                >
                  <View className="flex-1 mr-2">
                    <Text className="text-white text-base font-semibold" numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View className="flex-row items-center gap-1.5 mt-1">
                      <Text className="text-primary text-xs font-semibold">
                        {item.primary_muscle}
                      </Text>
                      <Text className="text-text-secondary text-xs">• {item.equipment}</Text>
                    </View>
                  </View>
                  <View className="w-9 h-9 rounded-full bg-primary/20 items-center justify-center">
                    <Text className="text-primary font-bold text-lg">+</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}
    </AppModal>
  );
};
