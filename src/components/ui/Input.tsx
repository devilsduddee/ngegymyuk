import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  leftIcon?: React.ReactNode;
  suffix?: string | React.ReactNode;
  isNumeric?: boolean;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isPassword = false,
  isNumeric = false,
  leftIcon,
  suffix,
  className = "",
  containerClassName = "mb-4",
  keyboardType,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getBorderColor = () => {
    if (error) return "border-[#EF4444]";
    if (isFocused) return "border-[#C7FF41]";
    return "border-white/[0.08]";
  };

  const getBackgroundColor = () => {
    if (isFocused) return "bg-[#141414]";
    return "bg-[#101010]";
  };

  const inputRef = React.useRef<TextInput>(null);

  const handleContainerPress = () => {
    console.log("[INPUT_PRESSED]", label || props.placeholder || "input");
    inputRef.current?.focus();
  };

  return (
    <View className={`w-full ${containerClassName}`}>
      {label ? (
        <View className="flex-row items-center justify-between mb-1.5 px-0.5">
          <Text
            className={`text-xs font-bold tracking-wide uppercase ${
              error
                ? "text-red-400"
                : isFocused
                ? "text-[#C7FF41]"
                : "text-zinc-400"
            }`}
          >
            {label}
          </Text>
        </View>
      ) : null}

      <TouchableOpacity
        activeOpacity={1}
        onPress={handleContainerPress}
        className={`flex-row items-center w-full h-[56px] rounded-[18px] border px-4 ${getBackgroundColor()} ${getBorderColor()} ${
          isFocused ? "shadow-sm shadow-lime-950/20" : ""
        }`}
      >
        {/* Left Icon (Integrated Field Icon) */}
        {leftIcon ? (
          <View className="mr-3 justify-center items-center">
            {leftIcon}
          </View>
        ) : null}

        {/* Text Input */}
        <TextInput
          ref={inputRef}
          className={`flex-1 text-[15px] font-semibold text-white h-full ${className}`}
          placeholderTextColor="#71717A"
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize={isPassword || isNumeric ? "none" : props.autoCapitalize}
          keyboardType={isNumeric ? "numeric" : keyboardType}
          selectionColor="#C7FF41"
          onPressIn={() => {
            console.log("[INPUT_PRESSED]", label || props.placeholder || "input");
          }}
          onFocus={(e) => {
            console.log("[INPUT_FOCUSED]", label || props.placeholder || "input");
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />

        {/* Suffix (e.g. Unit or Custom Node) */}
        {suffix ? (
          <View className="pl-2 justify-center">
            {typeof suffix === "string" ? (
              <Text className="text-zinc-400 text-xs font-semibold">
                {suffix}
              </Text>
            ) : (
              suffix
            )}
          </View>
        ) : null}

        {/* Password Eye Toggle Icon */}
        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="w-9 h-9 items-center justify-center -mr-1 rounded-full active:bg-white/[0.06]"
            accessibilityLabel={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={19}
              color={showPassword ? "#C7FF41" : "#71717A"}
            />
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>

      {/* Error Message */}
      {error ? (
        <View className="flex-row items-center gap-1 mt-1.5 px-1">
          <Ionicons name="alert-circle" size={13} color="#EF4444" />
          <Text className="text-[#EF4444] text-[11px] font-medium leading-none">
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
};
