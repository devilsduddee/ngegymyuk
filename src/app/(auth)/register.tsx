import React, { useState, useEffect } from "react";
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
import Animated, {
  FadeIn,
  FadeInUp,
} from "react-native-reanimated";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Toast } from "@/components/ui/Toast";
import { authService } from "@/features/auth/services/authService";
import { registerSchema } from "@/features/auth/utils/validation";
import { getHumanAuthError } from "@/features/auth/utils/authError";
import { useAuthStore } from "@/stores/authStore";

export default function RegisterScreen() {
  const router = useRouter();
  const { isLoading, setLoading } = useAuthStore();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [formErrors, setFormErrors] = useState<{
    displayName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const [isRegisteredSuccess, setIsRegisteredSuccess] = useState(false);

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

  // Handle 1.5s auto-redirect to login
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isRegisteredSuccess) {
      timer = setTimeout(() => {
        router.replace("/(auth)/login");
      }, 1500);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isRegisteredSuccess, router]);

  const handleRegister = async () => {
    if (isLoading) return;
    setFormErrors({});

    const validation = registerSchema.safeParse({
      displayName,
      email,
      password,
      confirmPassword,
    });

    if (!validation.success) {
      const fieldErrors: {
        displayName?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
      } = {};

      validation.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path === "displayName") fieldErrors.displayName = issue.message;
        if (path === "email") fieldErrors.email = issue.message;
        if (path === "password") fieldErrors.password = issue.message;
        if (path === "confirmPassword") fieldErrors.confirmPassword = issue.message;
      });

      setFormErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const result = await authService.registerWithEmail({
      email,
      password,
      displayName,
    });
    setLoading(false);

    if (result.error) {
      const humanMessage = getHumanAuthError(result.error);
      setFormErrors({ general: humanMessage });
      setToast({
        visible: true,
        type: "error",
        title: "Pendaftaran Gagal",
        message: humanMessage,
      });
    } else {
      setIsRegisteredSuccess(true);
      setToast({
        visible: true,
        type: "success",
        title: "Akun berhasil dibuat",
        message: "Registrasi berhasil",
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
    <SafeAreaView className="flex-1 bg-background">
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
          className="px-6 py-6"
          keyboardShouldPersistTaps="handled"
        >
          {isRegisteredSuccess ? (
            /* SUCCESS STATE - Clean Announcement */
            <Animated.View entering={FadeInUp.duration(350)} className="items-center">
              <View className="p-8 bg-[#161616] border border-zinc-800 rounded-2xl items-center w-full">
                <View className="px-3 py-1 rounded bg-[#C7FF41]/10 border border-[#C7FF41]/30 items-center justify-center mb-4">
                  <Text className="text-[11px] font-mono font-bold text-[#C7FF41] uppercase tracking-widest">
                    Pendaftaran Berhasil
                  </Text>
                </View>

                <Text className="text-2xl font-black text-white text-center tracking-tight mb-2">
                  Akun Siap Digunakan
                </Text>

                <Text className="text-sm text-zinc-400 text-center leading-relaxed mb-6">
                  Akun berhasil dibuat. Mengalihkan ke halaman login...
                </Text>

                <TouchableOpacity
                  onPress={() => router.replace("/(auth)/login")}
                  className="w-full h-14 bg-[#C7FF41] rounded-[18px] items-center justify-center min-h-[44px] mb-3 shadow-lg shadow-lime-950/40"
                >
                  <Text className="text-[#080808] font-black text-sm uppercase tracking-wider">
                    Masuk Sekarang
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ) : (
            /* REGISTRATION FORM */
            <Animated.View entering={FadeIn.duration(200)}>
              {/* Centered Brand Intro */}
              <View className="items-center pt-2 pb-4">
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
                  Daftar Akun Baru
                </Text>
              </View>

              {/* Onboarding Headline & Clean Copy */}
              <View className="items-center text-center mb-5 px-3">
                <Text className="text-2xl font-black text-white text-center tracking-tight">
                  Buat Akun
                </Text>
                <Text className="text-xs text-zinc-400 text-center mt-1 max-w-xs leading-relaxed">
                  Catat beban, set, repetisi, dan rekor pribadimu
                </Text>
              </View>

              {/* Form Surface */}
              <Card className="p-5 border-white/[0.08] bg-[#121212] mb-5 shadow-2xl">
                {formErrors.general ? (
                  <View className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-xl mb-4 flex-row items-center">
                    <Ionicons name="alert-circle" size={16} color="#EF4444" style={{ marginRight: 8 }} />
                    <Text className="text-red-400 text-xs font-medium flex-1 leading-relaxed">
                      {formErrors.general}
                    </Text>
                  </View>
                ) : null}

                <Input
                  label="Nama Lengkap"
                  placeholder="Nama lengkap"
                  value={displayName}
                  editable={!isLoading}
                  onChangeText={(text) => {
                    setDisplayName(text);
                    if (formErrors.displayName) setFormErrors((prev) => ({ ...prev, displayName: undefined }));
                    if (formErrors.general) setFormErrors((prev) => ({ ...prev, general: undefined }));
                  }}
                  error={formErrors.displayName}
                  autoCapitalize="words"
                  leftIcon={<Ionicons name="person-outline" size={18} color="#71717A" />}
                  containerClassName="mb-3.5"
                />

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
                  containerClassName="mb-3.5"
                />

                <Input
                  label="Konfirmasi Kata Sandi"
                  placeholder="Ulangi kata sandi"
                  value={confirmPassword}
                  editable={!isLoading}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (formErrors.confirmPassword) setFormErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    if (formErrors.general) setFormErrors((prev) => ({ ...prev, general: undefined }));
                  }}
                  error={formErrors.confirmPassword}
                  isPassword
                  leftIcon={<Ionicons name="shield-checkmark-outline" size={18} color="#71717A" />}
                  containerClassName="mb-5"
                />

                {/* Primary Register Button */}
                <Button
                  label={isLoading ? "Memproses..." : "Daftar"}
                  loading={isLoading}
                  onPress={handleRegister}
                  style={{
                    height: 52,
                    borderRadius: 14,
                  }}
                />

                {/* Clean Divider */}
                <View className="flex-row items-center my-4">
                  <View className="flex-1 h-[1px] bg-white/[0.06]" />
                  <Text className="mx-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    Atau daftar dengan
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

              {/* Footer Link to Login */}
              <View className="flex-row justify-center items-center py-1">
                <Text className="text-xs text-zinc-400">
                  Sudah punya akun?{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/login")}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text className="text-xs font-bold text-[#C7FF41]">
                    Masuk
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

