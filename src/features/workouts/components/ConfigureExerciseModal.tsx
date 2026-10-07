import React, { useState, useEffect } from "react";
import { Keyboard } from "react-native";
import { WorkoutTemplateExercise } from "@/types/workout";
import { Button } from "@/components/ui/Button";
import { AppModal } from "@/components/ui/AppModal";
import { Input } from "@/components/ui/Input";

interface ConfigureExerciseModalProps {
  visible: boolean;
  item: WorkoutTemplateExercise | null;
  onClose: () => void;
  onSave: (sets: number, reps: number, restSeconds: number) => void;
}

export const ConfigureExerciseModal: React.FC<ConfigureExerciseModalProps> = ({
  visible,
  item,
  onClose,
  onSave,
}) => {
  const [sets, setSets] = useState("4");
  const [reps, setReps] = useState("8");
  const [rest, setRest] = useState("90");

  useEffect(() => {
    if (visible) {
      const sub = Keyboard.addListener("keyboardDidShow", () => {
        console.log("[KEYBOARD_OPEN] ConfigureExerciseModal keyboard active");
      });
      return () => {
        sub.remove();
      };
    }
  }, [visible]);

  useEffect(() => {
    if (item) {
      setSets(String(item.target_sets));
      setReps(String(item.target_reps));
      setRest(String(item.rest_timer_seconds));
    }
  }, [item]);

  const handleSave = () => {
    const parsedSets = parseInt(sets, 10);
    const parsedReps = parseInt(reps, 10);
    const parsedRest = parseInt(rest, 10);

    // Clamping limits per Sprint 4B guidelines
    const s = Math.min(Math.max(isNaN(parsedSets) ? 4 : parsedSets, 1), 20);
    const r = Math.min(Math.max(isNaN(parsedReps) ? 8 : parsedReps, 1), 100);
    const t = Math.min(Math.max(isNaN(parsedRest) ? 90 : parsedRest, 0), 600);

    onSave(s, r, t);
    onClose();
  };

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title={item?.exercise?.name || "Ubah Konfigurasi"}
      presentation="center"
    >
      <Input
        label="Target Sets"
        value={sets}
        onChangeText={setSets}
        isNumeric
        containerClassName="mb-3"
      />

      <Input
        label="Target Reps"
        value={reps}
        onChangeText={setReps}
        isNumeric
        containerClassName="mb-3"
      />

      <Input
        label="Rest Timer (Detik)"
        value={rest}
        onChangeText={setRest}
        isNumeric
        suffix="detik"
        containerClassName="mb-4.5"
      />

      <Button label="Simpan Perubahan" size="md" onPress={handleSave} />
    </AppModal>
  );
};
