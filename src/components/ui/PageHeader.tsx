import React from "react";
import { View, Text, TouchableOpacity, StyleProp, ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  fallbackRoute?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  onBack,
  fallbackRoute,
  showBack = true,
  rightAction,
  className = "",
  style,
}) => {
  const router = useRouter();

  const handleBack = () => {
    Haptics.selectionAsync().catch(() => {});
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else if (fallbackRoute) {
      router.replace(fallbackRoute as never);
    } else {
      router.back();
    }
  };

  return (
    <View
      style={style}
      className={`px-5 py-3 border-b border-white/[0.06] bg-background flex-row items-center justify-between min-h-[56px] ${className}`}
    >
      {/* Left Slot: Icon Button */}
      <View className="min-w-[42px] items-start justify-center">
        {showBack ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.08] items-center justify-center active:bg-white/[0.12]"
            accessibilityRole="button"
            accessibilityLabel="Kembali"
          >
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View className="w-10 h-10" />
        )}
      </View>

      {/* Center Slot: Title & Subtitle Focal Point */}
      <View className="flex-1 px-3 items-center justify-center">
        <Text
          className="text-base font-bold text-white text-center tracking-tight"
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            className="text-[11px] text-zinc-400 text-center font-medium mt-0.5"
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* Right Slot: Custom Action or Spacer */}
      <View className="min-w-[42px] items-end justify-center">
        {rightAction ? (
          rightAction
        ) : (
          <View className="w-10 h-10" />
        )}
      </View>
    </View>
  );
};
