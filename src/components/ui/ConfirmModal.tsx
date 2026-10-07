import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
} from "react-native";

export type ConfirmModalVariant = "danger" | "warning" | "default";

export interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmModalVariant;
  confirmDisabled?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  variant = "default",
  confirmDisabled = false,
  onConfirm,
  onCancel,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: "⚠️",
          iconBg: "bg-status-error/15 border border-status-error/30",
          iconColor: "text-status-error",
          confirmButtonBg: "bg-[#EF4444]",
          confirmButtonText: "text-white font-bold",
        };
      case "warning":
        return {
          icon: "⚠️",
          iconBg: "bg-status-warning/15 border border-status-warning/30",
          iconColor: "text-status-warning",
          confirmButtonBg: "bg-status-warning",
          confirmButtonText: "text-[#080808] font-bold",
        };
      case "default":
      default:
        return {
          icon: "✓",
          iconBg: "bg-primary/15 border border-primary/30",
          iconColor: "text-primary",
          confirmButtonBg: "bg-primary",
          confirmButtonText: "text-[#080808] font-bold",
        };
    }
  };

  const currentVariant = getVariantStyles();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      {/* 1. Full-Screen Backdrop Overlay: solid 75% dark overlay blocking touches behind */}
      <View
        style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
        className="flex-1 justify-center items-center px-6"
      >
        {/* Backdrop dismiss touchable */}
        <Pressable
          onPress={onCancel}
          style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
        />

        {/* 2. Top-most Modal Card (#161616 surface, 20px radius, 20px padding) */}
        <View
          style={{
            backgroundColor: "#161616",
            borderRadius: 20,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 20,
            borderColor: "rgba(255, 255, 255, 0.08)",
            borderWidth: 1,
            zIndex: 999,
            elevation: 16,
          }}
          className="w-full max-w-sm shadow-2xl"
        >
          {/* Variant Icon */}
          <View className="items-center mb-3">
            <View
              className={`w-11 h-11 rounded-xl items-center justify-center ${currentVariant.iconBg}`}
            >
              <Text className={`text-lg ${currentVariant.iconColor}`}>
                {currentVariant.icon}
              </Text>
            </View>
          </View>

          {/* Title & Message */}
          <Text className="text-lg font-black text-white text-center mb-1.5 tracking-tight">
            {title}
          </Text>
          <Text className="text-xs text-text-secondary text-center leading-relaxed mb-5">
            {message}
          </Text>

          {/* Action Buttons */}
          <View className="flex-row gap-2.5">
            {/* Cancel Button (Secondary Style) */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onCancel}
              className="flex-1 min-h-[44px] items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.08]"
            >
              <Text className="text-white text-xs font-bold">
                {cancelText}
              </Text>
            </TouchableOpacity>

            {/* Confirm Button (Primary Lime or Danger) */}
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={confirmDisabled}
              onPress={onConfirm}
              className={`flex-1 min-h-[44px] items-center justify-center rounded-xl ${currentVariant.confirmButtonBg} ${
                confirmDisabled ? "opacity-50" : ""
              }`}
            >
              <Text className={`text-xs ${currentVariant.confirmButtonText}`}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
