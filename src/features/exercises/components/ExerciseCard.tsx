import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Exercise } from "@/types/exercise";

interface ExerciseCardProps {
  exercise: Exercise;
  onPress?: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onPress,
}) => {
  const getMuscleIcon = (muscle: string) => {
    switch (muscle.toLowerCase()) {
      case "chest":
        return "🏋️";
      case "back":
        return "🚣";
      case "shoulders":
        return "🛡️";
      case "biceps":
      case "triceps":
      case "forearms":
        return "💪";
      case "quads":
      case "hamstrings":
      case "glutes":
      case "calves":
        return "🦵";
      case "abs":
        return "⚡";
      default:
        return "🎯";
    }
  };

  const content = (
    <View className="p-4 mb-3 flex-row items-center justify-between bg-surface border border-border rounded-[20px] shadow-sm">
      <View className="flex-row items-center flex-1 pr-3">
        {/* Muscle Icon Avatar */}
        <View className="w-12 h-12 rounded-[14px] bg-background border border-border items-center justify-center mr-3.5">
          <Text className="text-xl">{getMuscleIcon(exercise.primary_muscle)}</Text>
        </View>

        {/* Title & Muscle Tag */}
        <View className="flex-1">
          <Text className="text-white text-base font-black tracking-tight" numberOfLines={1}>
            {exercise.name}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <View className="bg-primary/15 px-2 py-0.5 rounded-md">
              <Text className="text-primary text-[10px] font-black uppercase">
                {exercise.primary_muscle}
              </Text>
            </View>
            <Text className="text-text-secondary text-xs font-medium">
              {exercise.equipment}
            </Text>
          </View>
        </View>
      </View>

      {/* Right Chevron / Action */}
      <View className="w-8 h-8 rounded-full bg-background items-center justify-center border border-border">
        <Text className="text-text-secondary text-xs font-bold">→</Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

