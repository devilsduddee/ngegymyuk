import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  StyleProp,
  ViewStyle,
} from "react-native";

export type AppModalPresentation = "center" | "bottom-sheet";

export interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  presentation?: AppModalPresentation;
  dismissKeyboardOnTap?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  className?: string;
  showCloseButton?: boolean;
}

export const AppModal: React.FC<AppModalProps> = ({
  visible,
  onClose,
  title,
  children,
  presentation = "center",
  dismissKeyboardOnTap = true,
  contentStyle,
  className = "",
  showCloseButton = true,
}) => {
  const isBottomSheet = presentation === "bottom-sheet";

  const renderContent = () => (
    <View
      style={[
        isBottomSheet
          ? {
              backgroundColor: "#161616",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderColor: "rgba(255, 255, 255, 0.08)",
              borderTopWidth: 1,
              width: "100%",
            }
          : {
              backgroundColor: "#161616",
              borderRadius: 20,
              paddingHorizontal: 20,
              paddingTop: 18,
              paddingBottom: 20,
              borderColor: "rgba(255, 255, 255, 0.08)",
              borderWidth: 1,
              width: "100%",
              maxWidth: 380,
              alignSelf: "center",
              elevation: 16,
            },
        contentStyle,
      ]}
      className={`shadow-2xl ${className}`}
    >
      {/* Header: Title + Subtle Minimal Close Icon Button */}
      {title || showCloseButton ? (
        <View
          className={`flex-row items-center justify-between ${
            isBottomSheet ? "px-6 pt-5 pb-3 border-b border-border/50" : "mb-3.5"
          }`}
        >
          {title ? (
            <Text
              className="text-lg font-black text-white flex-1 mr-2 tracking-tight"
              numberOfLines={1}
            >
              {title}
            </Text>
          ) : (
            <View className="flex-1" />
          )}

          {showCloseButton ? (
            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              onPress={onClose}
              className="w-8 h-8 items-center justify-center rounded-full bg-white/[0.06] active:bg-white/[0.12]"
              accessibilityLabel="Tutup dialog"
            >
              <Text className="text-zinc-400 font-bold text-xs">✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {children}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isBottomSheet ? "slide" : "fade"}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
        className={`flex-1 ${
          isBottomSheet ? "justify-end" : "justify-center px-6"
        }`}
      >
        {/* Backdrop Touchable: handles keyboard dismissal and/or backdrop tap outside modal without wrapping modal content */}
        <Pressable
          style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
          onPress={() => {
            if (dismissKeyboardOnTap) {
              Keyboard.dismiss();
            }
          }}
          importantForAccessibility="no"
          accessibilityElementsHidden
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className={isBottomSheet ? "w-full" : undefined}
          pointerEvents="box-none"
        >
          {renderContent()}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
