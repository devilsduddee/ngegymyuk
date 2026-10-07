import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WorkoutTemplate, WorkoutTemplateExercise } from "@/types/workout";
import { workoutTemplateExerciseService } from "@/features/workouts/services/workoutTemplateExerciseService";
import { Button } from "@/components/ui/Button";

interface HeroTemplateCardProps {
  template: WorkoutTemplate;
  onPress: () => void;
  onStartWorkout: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const HeroTemplateCard: React.FC<HeroTemplateCardProps> = ({
  template,
  onPress,
  onStartWorkout,
  onEdit,
  onDelete,
}) => {
  const [exercises, setExercises] = useState<WorkoutTemplateExercise[]>(
    template.exercises || []
  );
  const [showAll, setShowAll] = useState(false);
  const count = template.exercise_count ?? exercises.length;
  const estimatedMins = Math.max(15, count * 12);

  // Sync immediately if template prop already has exercises in store
  useEffect(() => {
    if (template.exercises && template.exercises.length > 0) {
      setExercises(template.exercises);
    }
  }, [template.exercises, template.updated_at]);

  useEffect(() => {
    let isMounted = true;
    workoutTemplateExerciseService.getTemplateExercises(template.id).then(({ data }) => {
      if (isMounted && data) {
        setExercises(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [template.id, template.updated_at]);

  const displayedExercises = showAll ? exercises : exercises.slice(0, 3);

  return (
    <View className="rounded-2xl bg-[#121212] border border-white/[0.08] p-5 mb-4">
      {/* Header Row: Routine Name, Subtitle & Edit/Delete Icons */}
      <View className="flex-row items-start justify-between mb-3">
        <Pressable onPress={onPress} className="flex-1 mr-2 active:opacity-85">
          <View className="flex-row items-center gap-1.5 mb-1">
            <View className="w-2 h-2 rounded-full bg-[#C7FF41]" />
            <Text className="text-[11px] font-bold text-[#C7FF41] uppercase tracking-wider">
              Template Utama
            </Text>
          </View>
          <Text className="text-white text-2xl font-black tracking-tight" numberOfLines={1}>
            {template.name}
          </Text>
          <Text className="text-zinc-400 text-xs mt-1 font-medium">
            {count > 0 ? `${count} Latihan • Estimasi ~${estimatedMins} mnt` : "Belum ada latihan"}
          </Text>
        </Pressable>

        <View className="flex-row items-center gap-1.5 pt-1">
          <Pressable
            onPress={onEdit}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="w-8 h-8 rounded-full bg-white/[0.04] items-center justify-center active:bg-white/10"
          >
            <Ionicons name="pencil-outline" size={15} color="#A3A3A3" />
          </Pressable>
          <Pressable
            onPress={onDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="w-8 h-8 rounded-full bg-red-500/10 items-center justify-center active:bg-red-500/20"
          >
            <Ionicons name="trash-outline" size={15} color="#EF4444" />
          </Pressable>
        </View>
      </View>

      {/* Exercise Preview (Clean Typography, No Nested Box-in-Box) */}
      {exercises.length > 0 && (
        <View className="pt-3 pb-4 border-t border-white/[0.06] mb-1">
          <View className="gap-2">
            {displayedExercises.map((ex, idx) => (
              <Pressable
                key={ex.id || idx}
                onPress={onPress}
                className="flex-row items-center justify-between py-1 active:opacity-80"
              >
                <View className="flex-row items-center gap-2 flex-1 mr-2">
                  <Text className="text-zinc-500 text-xs font-mono font-bold w-4">
                    {idx + 1}.
                  </Text>
                  <Text
                    className="text-white text-sm font-semibold flex-1"
                    numberOfLines={1}
                  >
                    {ex.exercise?.name || `Latihan #${idx + 1}`}
                  </Text>
                </View>
                <Text className="text-zinc-400 text-xs font-medium">
                  {ex.target_sets} × {ex.target_reps} reps
                </Text>
              </Pressable>
            ))}
          </View>

          {exercises.length > 3 && (
            <Pressable
              onPress={() => setShowAll(!showAll)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="flex-row items-center gap-1 pt-2.5 self-start"
            >
              <Text className="text-[#C7FF41] text-xs font-semibold">
                {showAll ? "Ciutkan daftar" : `+ ${exercises.length - 3} latihan lainnya`}
              </Text>
              <Ionicons
                name={showAll ? "chevron-up" : "chevron-down"}
                size={12}
                color="#C7FF41"
              />
            </Pressable>
          )}
        </View>
      )}

      {/* Prominent Primary CTA: MULAI LATIHAN */}
      <Button
        label="Mulai Latihan"
        size="lg"
        variant="primary"
        leftIcon={<Ionicons name="play" size={16} color="#080808" />}
        onPress={onStartWorkout}
        style={{
          borderRadius: 14,
          height: 52,
        }}
      />
    </View>
  );
};
