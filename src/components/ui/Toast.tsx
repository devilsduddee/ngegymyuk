import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

export interface ToastProps {
  visible: boolean;
  type?: "success" | "error" | "info";
  title?: string;
  message: string;
  onDismiss?: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  type = "info",
  title,
  message,
  onDismiss,
  duration = 4000,
}) => {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Enter with snappy spring
      translateY.value = withSpring(0, { damping: 14, stiffness: 220 });
      opacity.value = withTiming(1, { duration: 200 });

      if (duration > 0 && onDismiss) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      translateY.value = withTiming(-100, { duration: 250 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, duration]);

  const handleDismiss = () => {
    translateY.value = withTiming(-100, { duration: 200 }, (finished) => {
      if (finished && onDismiss) {
        runOnJS(onDismiss)();
      }
    });
    opacity.value = withTiming(0, { duration: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) {
    return null;
  }

  const getBorderAndBg = () => {
    switch (type) {
      case "success":
        return "bg-[#161616] border-[#22C55E]/40 shadow-green-950/30";
      case "error":
        return "bg-[#161616] border-[#EF4444]/40 shadow-red-950/30";
      case "info":
      default:
        return "bg-[#161616] border-border shadow-black/40";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <View className="w-8 h-8 rounded-full bg-green-500/15 border border-green-500/30 items-center justify-center mr-3">
            <Text className="text-green-400 font-bold text-sm">✓</Text>
          </View>
        );
      case "error":
        return (
          <View className="w-8 h-8 rounded-full bg-red-500/15 border border-red-500/30 items-center justify-center mr-3">
            <Text className="text-red-400 font-bold text-sm">✕</Text>
          </View>
        );
      case "info":
      default:
        return (
          <View className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 items-center justify-center mr-3">
            <Text className="text-primary font-bold text-sm">ℹ</Text>
          </View>
        );
    }
  };

  return (
    <Animated.View
      style={[animatedStyle, { pointerEvents: "box-none" }]}
      className="absolute top-12 left-5 right-5 z-50"
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleDismiss}
        className={`flex-row items-center p-4 rounded-2xl border shadow-xl ${getBorderAndBg()}`}
      >
        {getIcon()}
        <View className="flex-1 mr-2">
          {title ? (
            <Text className="text-white font-bold text-sm mb-0.5 tracking-tight">
              {title}
            </Text>
          ) : null}
          <Text className="text-[#A1A1AA] text-xs leading-relaxed">
            {message}
          </Text>
        </View>
        <Text className="text-[#71717A] text-xs font-semibold px-1">✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
