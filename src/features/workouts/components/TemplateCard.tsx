import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WorkoutTemplate } from "@/types/workout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface TemplateCardProps {
  template: WorkoutTemplate;
  onPress: () => void;
  onStartWorkout?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onPress,
  onStartWorkout,
  onEdit,
  onDelete,
}) => {
  const count = template.exercise_count ?? 0;
  const estimatedMins = Math.max(15, count * 12);

  return (
    <Card className="p-0 overflow-hidden mb-3.5 bg-surface-card border-white/[0.08]">
      {/* 1. Header & Title Block (Tap goes to detail) */}
      <Pressable onPress={onPress} className="p-4 pb-3 active:opacity-85">
        <View className="flex-row items-center justify-between mb-1.5">
          <View className="flex-1 mr-2">
            <Text
              className="text-white text-base font-bold tracking-tight"
              numberOfLines={1}
            >
              {template.name}
            </Text>
          </View>

          {/* Quick Edit/Delete icons with 44px touch targets */}
          <View className="flex-row items-center gap-1">
            {onEdit && (
              <Pressable
                onPress={onEdit}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="w-8 h-8 rounded-full bg-white/[0.04] items-center justify-center active:bg-white/10"
              >
                <Ionicons name="pencil-outline" size={15} color="#A3A3A3" />
              </Pressable>
            )}
            {onDelete && (
              <Pressable
                onPress={onDelete}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="w-8 h-8 rounded-full bg-red-500/10 items-center justify-center active:bg-red-500/20"
              >
                <Ionicons name="trash-outline" size={15} color="#EF4444" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Subtitle / Telemetry Info */}
        <Text className="text-zinc-400 text-xs font-normal mb-1">
          {count > 0 ? `${count} gerakan terdaftar • Ketuk untuk kelola` : "Belum ada gerakan • Tambahkan latihan"}
        </Text>
      </Pressable>

      {/* 2. Telemetry Footer & Quick Start Action */}
      <View className="flex-row items-center justify-between px-4 py-2.5 bg-[#141414] border-t border-white/[0.05]">
        <View className="flex-row items-center gap-3 text-zinc-400">
          <View className="flex-row items-center gap-1">
            <Ionicons name="fitness-outline" size={14} color="#71717A" />
            <Text className="text-zinc-400 text-xs font-medium">
              {count} Latihan
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={14} color="#71717A" />
            <Text className="text-zinc-400 text-xs font-medium">
              ~{estimatedMins}m
            </Text>
          </View>
        </View>

        {onStartWorkout && (
          <Button
            label="Mulai"
            size="md"
            variant="primary"
            leftIcon={<Ionicons name="play" size={14} color="#080808" />}
            onPress={onStartWorkout}
            style={{ height: 36, paddingHorizontal: 14, borderRadius: 10 }}
          />
        )}
      </View>
    </Card>
  );
};
