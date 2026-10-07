import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

// Safe local audio asset reference
const LOCAL_BEEP = require("../../../../assets/beep.wav");

let isAudioConfigured = false;
async function ensureAudioMode() {
  if (isAudioConfigured || Platform.OS === "web") return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "duckOthers",
    });
    isAudioConfigured = true;
  } catch (err) {
    console.warn("Failed to set audio mode:", err);
  }
}

export const soundHapticService = {
  // Trigger medium impact on completing a set
  async triggerSetComplete() {
    try {
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch {}
  },

  // Trigger heavy/success notification when workout is completed
  async triggerWorkoutComplete() {
    try {
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {}
  },

  // Stronger triple-pulse haptic feedback when rest timer finishes
  async triggerRestTimerFinished() {
    try {
      if (Platform.OS === "web") return;

      // Pulse 1: Strong notification
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      await new Promise((r) => setTimeout(r, 200));

      // Pulse 2: Heavy impact
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await new Promise((r) => setTimeout(r, 200));

      // Pulse 3: Heavy impact confirmation
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
  },

  // Web Audio oscillator beep helper
  _playWebOscillator(ctx: AudioContext, time: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(988, time); // 988Hz B5 tone

    // Punchy loud gym beep
    gain.gain.setValueAtTime(0.85, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.15);
  },

  // Play single beep on native
  async _playSingleNativeBeep(): Promise<void> {
    try {
      const player = createAudioPlayer(LOCAL_BEEP);
      player.volume = 1.0;
      player.play();
    } catch (err) {
      console.warn("Native beep playback error:", err);
    }
  },

  // Play triple beep notification: beep -> 200ms -> beep -> 200ms -> beep
  async playTripleBeep() {
    try {
      // 1. Web fallback using Web Audio API
      if (Platform.OS === "web" && typeof window !== "undefined") {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const now = ctx.currentTime;
          this._playWebOscillator(ctx, now);
          this._playWebOscillator(ctx, now + 0.35); // 150ms beep + 200ms pause
          this._playWebOscillator(ctx, now + 0.70); // 150ms beep + 200ms pause
          return;
        }
      }

      // 2. Native Android / iOS
      await ensureAudioMode();

      // Beep 1
      await this._playSingleNativeBeep();
      await new Promise((r) => setTimeout(r, 350)); // 150ms sound + 200ms silence

      // Beep 2
      await this._playSingleNativeBeep();
      await new Promise((r) => setTimeout(r, 350));

      // Beep 3
      await this._playSingleNativeBeep();
    } catch (err) {
      console.warn("Triple beep playback failed:", err);
    }
  },

  // Backward compatibility alias
  async playBeepSound() {
    await this.playTripleBeep();
  },
};

