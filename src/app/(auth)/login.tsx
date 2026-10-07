import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Toast } from "@/components/ui/Toast";
import { authService } from "@/features/auth/services/authService";
import { loginSchema } from "@/features/auth/utils/validation";
import { getHumanAuthError } from "@/features/auth/utils/authError";
import { useAuthStore } from "@/stores/authStore";

export default function LoginScreen() {
  const router = useRouter();
  const { isLoading, setLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const [toast, setToast] = useState<{
    visible: boolean;
    type: "success" | "error" | "info";
    title: string;
    message: string;
  }>({
    visible: false,
    type: "info",
    title: "",
    message: "",
  });

  const handleLogin = async () => {
    if (isLoading) return;
    setFormErrors({});

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0] === "email") fieldErrors.email = issue.message;
        if (issue.path[0] === "password") fieldErrors.password = issue.message;
      });
      setFormErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const result = await authService.loginWithEmail({ email, password });
    setLoading(false);

    if (result.error) {
      const humanMessage = getHumanAuthError(result.error);
      setFormErrors({ general: humanMessage });
      setToast({
        visible: true,
        type: "error",
        title: "Gagal Masuk",
        message: humanMessage,
      });
    } else {
      setToast({
        visible: true,
        type: "success",
        title: "Berhasil Masuk",
        message: "Menyiapkan sesi latihan Anda...",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    setFormErrors({});
    setLoading(true);
    const result = await authService.signInWithGoogle();
    setLoading(false);

    if (result.error) {
      const humanMessage = getHumanAuthError(result.error);
      setFormErrors({ general: humanMessage });
      setToast({
        visible: true,
        type: "error",
        title: "Google Sign-In Gagal",
        message: humanMessage,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#080808]">
      <Toast
        visible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          className="px-5 py-6"
          keyboardShouldPersistTaps="handled"
        >
          {/* Centered Brand Intro */}
          <View className="items-center pt-2 pb-5">
            <View className="w-16 h-16 rounded-2xl bg-[#141414] border border-white/[0.08] items-center justify-center mb-3 shadow-lg">
              <View className="w-10 h-10 rounded-xl bg-[#C7FF41] items-center justify-center">
                <Ionicons name="barbell" size={22} color="#080808" />
              </View>
            </View>

            <View className="flex-row items-center gap-1.5">
              <Text className="text-2xl font-black text-white tracking-tight">
                ngegym<Text className="text-[#C7FF41]">Yuk</Text>
              </Text>
              <View className="w-2 h-2 rounded-full bg-[#C7FF41]" />
            </View>

            <Text className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mt-1">
              Performance Tracker
            </Text>
          </View>

          {/* Onboarding Headline & Clean Copy */}
          <View className="items-center text-center mb-6 px-3">
            <Text className="text-2xl font-black text-white text-center tracking-tight">
              Masuk ke Akun
            </Text>
            <Text className="text-xs text-zinc-400 text-center mt-1 max-w-xs leading-relaxed">
              Catat log latihan dan pantau rekor pribadimu
            </Text>
          </View>

          {/* Main Form Container */}
          <Card className="p-5 border-white/[0.08] bg-[#121212] mb-5 shadow-2xl">
            {/* Error Banner */}
            {formErrors.general ? (
              <View className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-xl mb-4 flex-row items-center">
                <Ionicons name="alert-circle" size={16} color="#EF4444" style={{ marginRight: 8 }} />
                <Text className="text-red-400 text-xs font-medium flex-1 leading-relaxed">
                  {formErrors.general}
                </Text>
              </View>
            ) : null}

            {/* Email Field */}
            <Input
              label="Alamat Email"
              placeholder="nama@email.com"
              value={email}
              editable={!isLoading}
              onChangeText={(text) => {
                setEmail(text);
                if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }));
                if (formErrors.general) setFormErrors((prev) => ({ ...prev, general: undefined }));
              }}
              error={formErrors.email}
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
              leftIcon={<Ionicons name="mail-outline" size={18} color="#71717A" />}
              containerClassName="mb-3.5"
            />

            {/* Password Field */}
            <Input
              label="Kata Sandi"
              placeholder="Minimal 6 karakter"
              value={password}
              editable={!isLoading}
              onChangeText={(text) => {
                setPassword(text);
                if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: undefined }));
                if (formErrors.general) setFormErrors((prev) => ({ ...prev, general: undefined }));
              }}
              error={formErrors.password}
              isPassword
              leftIcon={<Ionicons name="lock-closed-outline" size={18} color="#71717A" />}
              containerClassName="mb-5"
            />

            {/* Primary Action Button */}
            <Button
              label={isLoading ? "Memproses..." : "Masuk"}
              loading={isLoading}
              onPress={handleLogin}
              style={{
                height: 52,
                borderRadius: 14,
              }}
            />

            {/* Clean Divider */}
            <View className="flex-row items-center my-4">
              <View className="flex-1 h-[1px] bg-white/[0.06]" />
              <Text className="mx-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Atau masuk dengan
              </Text>
              <View className="flex-1 h-[1px] bg-white/[0.06]" />
            </View>

            {/* Structured Google OAuth Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={isLoading}
              onPress={handleGoogleSignIn}
              className="flex-row items-center justify-center gap-2.5 h-12 bg-[#181818] border border-white/[0.08] rounded-xl active:bg-[#222222]"
            >
              <Ionicons name="logo-google" size={17} color="#FFFFFF" />
              <Text className="text-white text-xs font-bold tracking-wide">
                Google
              </Text>
            </TouchableOpacity>
          </Card>

          {/* Footer Link to Register */}
          <View className="flex-row justify-center items-center py-1">
            <Text className="text-xs text-zinc-400">
              Belum punya akun?{" "}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/register")}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text className="text-xs font-bold text-[#C7FF41]">
                Daftar
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

