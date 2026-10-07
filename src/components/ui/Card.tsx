import React from "react";
import { View, ViewProps, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";


interface CardProps extends ViewProps {
  children: React.ReactNode;
  interactive?: boolean;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  interactive = false,
  onPress,
  ...props
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (interactive && onPress) {
    return (
      <AnimatedPressable
        onPressIn={() => {
          scale.value = withSpring(0.98, { damping: 15, stiffness: 350 });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 350 });
        }}
        onPress={onPress}
        style={animatedStyle}
        className={`bg-surface border border-white/[0.08] rounded-[24px] p-5 ${className}`}
        {...props}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View
      className={`bg-surface border border-white/[0.08] rounded-[24px] p-5 ${className}`}
      {...props}
    >
      {children}
    </View>
  );
};
