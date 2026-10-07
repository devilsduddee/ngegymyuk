import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/authStore";
import { useAnalyticsStore } from "@/stores/analyticsStore";
import { authService } from "@/features/auth/services/authService";
import { ConfirmModal, ConfirmModalVariant } from "@/components/ui/ConfirmModal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ProfileScreen() {
  const { user, reset } = useAuthStore();
  const { summary, fetchAnalytics } = useAnalyticsStore();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Custom ConfirmModal state
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: ConfirmModalVariant;
    onConfirm: () => void | Promise<void>;
  }>({
    visible: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const handleLogout = async () => {
    setConfirmModal({
      visible: true,
      title: "Keluar dari Akun",
      message: "Apakah Anda yakin ingin keluar dari sesi akun Anda?",
      confirmText: "Keluar",
      cancelText: "Batal",
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, visible: false }));
        setLoggingOut(true);
        const result = await authService.signOut();
        setLoggingOut(false);

        if (result.error) {
          setConfirmModal({
            visible: true,
            title: "Gagal Keluar",
            message: result.error,
            confirmText: "Tutup",
            cancelText: "Batal",
            variant: "warning",
            onConfirm: () => setConfirmModal((prev) => ({ ...prev, visible: false })),
          });
        } else {
          reset();
        }
      },
    });
  };

  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "Sobat Gym";
  const initial = displayName.charAt(0).toUpperCase();

  const totalWorkoutsCount = summary?.totalWorkouts ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1 px-5 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ATHLETE HERO DASHBOARD */}
        <View className="items-center pt-6 pb-6">
          <View className="relative mb-3.5">
            <View className="w-24 h-24 rounded-full bg-surface border-2 border-primary items-center justify-center shadow-lg shadow-lime-950/40">
              <Text className="text-4xl font-black text-primary">
                {initial}
              </Text>
            </View>
            <View className="absolute bottom-0 right-1 w-6 h-6 rounded-full bg-status-success border-2 border-background items-center justify-center">
              <View className="w-2 h-2 rounded-full bg-white" />
            </View>
          </View>

          <Text className="text-2xl font-black text-white tracking-tight">
            {displayName}
          </Text>
          <Text className="text-xs font-medium text-text-secondary mt-0.5">
            {user?.email || "Tidak ada email"}
          </Text>
        </View>

        {/* ATHLETE LIFETIME STATS (Single Unified Athlete Surface) */}
        <View className="mb-6">
          <View className="p-5 rounded-2xl bg-[#121212] border border-white/[0.08]">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3">
              Akumulasi Latihan
            </Text>

            <View className="flex-row items-center justify-around py-1">
              <View className="items-center flex-1">
                <Text className="text-3xl font-black text-white">
                  {totalWorkoutsCount}
                </Text>
                <Text className="text-zinc-400 text-xs mt-0.5 font-medium">
                  Sesi Latihan
                </Text>
              </View>

              <View className="w-[1px] h-10 bg-white/[0.08]" />

              <View className="items-center flex-1">
                <Text className="text-3xl font-black text-[#C7FF41]">
                  {Math.round(summary?.totalVolume ?? 0).toLocaleString("id-ID")}
                </Text>
                <Text className="text-zinc-400 text-xs mt-0.5 font-medium">
                  Total kg Volume
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ACCOUNT SETTINGS (Clean, Minimal, Non-Admin) */}
        <View className="mb-8">
          <Text className="text-xs font-semibold text-zinc-400 mb-3 px-1">
            Status Akun & Aplikasi
          </Text>

          <View className="p-4 rounded-2xl bg-[#121212] border border-white/[0.08]">
            <View className="flex-row justify-between items-center py-2 border-b border-white/[0.06]">
              <Text className="text-zinc-400 text-xs">Sinkronisasi Cloud</Text>
              <View className="flex-row items-center gap-1.5">
                <View className="w-2 h-2 rounded-full bg-[#C7FF41]" />
                <Text className="text-[#C7FF41] text-xs font-bold">
                  Tersambung
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center py-2">
              <Text className="text-zinc-400 text-xs">Versi Aplikasi</Text>
              <Text className="text-white text-xs font-semibold">v1.0.0</Text>
            </View>
          </View>
        </View>

        {/* LOGOUT BUTTON WITH BUTTON SYSTEM */}
        <Button
          label="Keluar dari Akun"
          variant="danger"
          size="lg"
          loading={loggingOut}
          onPress={handleLogout}
        />
      </ScrollView>

      {/* Reusable Dark Confirm Modal */}
      <ConfirmModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}
