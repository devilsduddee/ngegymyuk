import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function TestNativeWindScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6 py-6" contentContainerStyle={{ alignItems: "center" }}>
        <Text className="text-2xl font-bold text-white mb-2">
          NativeWind Verification
        </Text>
        <Text className="text-sm text-text-secondary mb-6 text-center">
          Memvalidasi penerapan styling NativeWind dan token warna DESIGN.md
        </Text>

        {/* 1. Test bg-red-500 */}
        <View className="w-full mb-4">
          <Text className="text-xs font-semibold text-text-secondary uppercase mb-1.5">
            1. Test Standard Tailwind (bg-red-500)
          </Text>
          <View className="bg-red-500 w-full h-16 rounded-2xl items-center justify-center">
            <Text className="text-white font-bold text-base">
              className="bg-red-500"
            </Text>
          </View>
        </View>

        {/* 2. Test bg-primary / bg-orange (#FC4C02) */}
        <View className="w-full mb-4">
          <Text className="text-xs font-semibold text-text-secondary uppercase mb-1.5">
            2. Test Design System Primary (#FC4C02)
          </Text>
          <View className="bg-primary w-full h-16 rounded-2xl items-center justify-center">
            <Text className="text-white font-bold text-base">
              className="bg-primary" (#FC4C02)
            </Text>
          </View>
        </View>

        {/* 3. Test Text White & Hierarchy */}
        <View className="w-full mb-4">
          <Text className="text-xs font-semibold text-text-secondary uppercase mb-1.5">
            3. Test Text Colors (text-white & text-text-secondary)
          </Text>
          <View className="bg-surface border border-border w-full p-4 rounded-2xl">
            <Text className="text-white font-bold text-lg mb-1">
              Text White Primary (#FFFFFF)
            </Text>
            <Text className="text-text-secondary text-sm">
              Text Secondary Muted (#A1A1AA)
            </Text>
          </View>
        </View>

        {/* 4. Test Card Surface (#161616) */}
        <View className="w-full mb-6">
          <Text className="text-xs font-semibold text-text-secondary uppercase mb-1.5">
            4. Test Card Surface (#161616) & Border (#252525)
          </Text>
          <Card className="w-full">
            <Text className="text-white font-semibold text-base mb-1">
              Card Surface Component
            </Text>
            <Text className="text-text-secondary text-xs leading-relaxed">
              Container surface gelap dengan border halus radius 20px sesuai DESIGN.md.
            </Text>
          </Card>
        </View>

        {/* 5. Buttons */}
        <View className="w-full gap-3">
          <Button label="Primary Button" variant="primary" />
          <Button label="Secondary Button" variant="secondary" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
