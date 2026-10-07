import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "danger"
  | "ghost";
export type ButtonSize = "md" | "lg";

export interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
}


export const Button: React.FC<ButtonProps> = ({
  label,
  variant = "primary",
  size = "lg",
  loading = false,
  disabled,
  leftIcon,
  className = "",
  style,
  onPress,
  ...props
}) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case "secondary":
        return {
          backgroundColor: "#171717",
          borderColor: "rgba(255, 255, 255, 0.12)",
          borderWidth: 1,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: "rgba(255, 255, 255, 0.2)",
          borderWidth: 1,
        };
      case "danger":
        return {
          backgroundColor: "rgba(239, 68, 68, 0.15)",
          borderColor: "rgba(239, 68, 68, 0.3)",
          borderWidth: 1,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          borderWidth: 0,
        };
      case "primary":
      default:
        return {
          backgroundColor: "#C7FF41",
          borderColor: "#C7FF41",
          borderWidth: 1,
        };
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case "md":
        return {
          height: 44,
          paddingHorizontal: 16,
          borderRadius: 14,
        };
      case "lg":
      default:
        return {
          height: 52,
          paddingHorizontal: 20,
          borderRadius: 16,
        };
    }
  };

  const getTextColor = () => {
    if (variant === "primary") return "#080808";
    if (variant === "danger") return "#F87171";
    if (variant === "ghost") return "#A3A3A3";
    return "#FFFFFF";
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        getVariantStyle(),
        getSizeStyle(),
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          opacity: isDisabled ? 0.5 : 1,
        },
        style as ViewStyle,
      ]}
      className={className}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "#080808" : variant === "danger" ? "#F87171" : "#FFFFFF"}
          style={{ marginRight: 8 }}
        />
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
          {leftIcon ? (
            <View style={{ marginRight: 8, alignItems: "center", justifyContent: "center" }}>
              {leftIcon}
            </View>
          ) : null}
          <Text
            style={{
              color: getTextColor(),
              fontWeight: "700",
              fontSize: size === "lg" ? 15 : 13,
              textAlign: "center",
              letterSpacing: -0.2,
            }}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
