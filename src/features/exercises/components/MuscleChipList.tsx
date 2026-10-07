import React from "react";
import { ScrollView, TouchableOpacity, Text } from "react-native";
import { MuscleGroup } from "@/types/exercise";

const MUSCLE_GROUPS: MuscleGroup[] = [
  "All",
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Abs",
  "Forearms",
];

interface MuscleChipListProps {
  selectedMuscle: MuscleGroup;
  onSelectMuscle: (muscle: MuscleGroup) => void;
}

export const MuscleChipList: React.FC<MuscleChipListProps> = ({
  selectedMuscle,
  onSelectMuscle,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, gap: 8, alignItems: "center" }}
      className="h-12 my-2"
    >
      {MUSCLE_GROUPS.map((muscle) => {
        const isSelected = selectedMuscle === muscle;
        return (
          <TouchableOpacity
            key={muscle}
            activeOpacity={0.7}
            onPress={() => onSelectMuscle(muscle)}
            className={`min-h-[44px] justify-center px-4 rounded-full border ${
              isSelected
                ? "bg-primary border-primary shadow-sm"
                : "bg-surface border-white/[0.08] active:bg-zinc-800"
            }`}
          >
            <Text
              className={`text-sm ${
                isSelected ? "text-[#080808] font-bold" : "text-text-secondary font-medium"
              }`}
            >
              {muscle === "All" ? "Semua Otot" : muscle}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};
