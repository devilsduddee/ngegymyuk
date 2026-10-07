import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Button } from "@/components/ui/Button";

export interface EmptyStateProps {
  icon?: string | React.ReactNode;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "🔍",
  title = "Belum Ada Data",
  message = "Belum ada data untuk ditampilkan saat ini.",
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      className={`flex-1 items-center justify-center py-12 px-6 ${className}`}
    >

      <View className="w-16 h-16 rounded-[20px] bg-surface border border-border items-center justify-center mb-4 shadow-sm">
        {typeof icon === "string" ? (
          <Text className="text-2xl">{icon}</Text>
        ) : (
          icon
        )}
      </View>
      <Text className="text-lg font-bold text-white text-center mb-1.5">
        {title}
      </Text>
      <Text className="text-sm text-text-secondary text-center max-w-xs mb-6 leading-relaxed">
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          variant="secondary"
          size="md"
          onPress={onAction}
        />
      ) : null}
    </Animated.View>
  );
};

