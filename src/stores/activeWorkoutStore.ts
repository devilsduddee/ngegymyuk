import { create } from "zustand";
import {
  WorkoutSession,
  WorkoutSet,
  WorkoutSummary,
  PRAchievement,
} from "@/types/session";
import { WorkoutTemplate, WorkoutTemplateExercise } from "@/types/workout";
import { workoutSessionService } from "@/features/workouts/services/workoutSessionService";
import { soundHapticService } from "@/features/workouts/services/soundHapticService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ACTIVE_WORKOUT_PERSIST_KEY = "@ngegymyuk_active_workout_state";

interface RestTimerState {
  isActive: boolean;
  isPaused: boolean;
  totalSeconds: number;
  remainingSeconds: number;
}

interface ActiveWorkoutStoreState {
  activeSession: WorkoutSession | null;
  exercises: WorkoutTemplateExercise[];
  currentExerciseIndex: number;
  loggedSets: WorkoutSet[];
  elapsedSeconds: number;
  startedAtTimestamp: number | null;
  isTimerRunning: boolean;
  isLoggingSet: boolean;
  isCompleting: boolean;
  lastSummary: WorkoutSummary | null;

  // Rest Timer State
  restTimer: RestTimerState;
  isRestCompleted: boolean;
  dismissRestCompleted: () => void;

  // PR Celebration State
  activePR: PRAchievement | null;
  achievedPRs: PRAchievement[];

  // Session Recovery
  hasRecoverableSession: boolean;

  // Actions
  checkForRecoverableSession: () => Promise<boolean>;
  recoverSession: () => Promise<boolean>;
  startWorkoutFromTemplate: (
    template: WorkoutTemplate,
    exercises: WorkoutTemplateExercise[]
  ) => Promise<boolean>;
  tickWorkoutTimer: () => void;

  // Rest Timer actions
  startRestTimer: (seconds: number) => void;
  pauseRestTimer: () => void;
  resumeRestTimer: () => void;
  skipRestTimer: () => void;
  tickRestTimer: () => void;

  // Set actions
  completeSet: (weight: number, reps: number) => Promise<WorkoutSet | null>;
  dismissPR: () => void;

  // Exercise Navigation
  nextExercise: () => void;
  prevExercise: () => void;

  // Finish / Discard
  finishWorkout: () => Promise<WorkoutSummary | null>;
  discardWorkout: () => Promise<void>;
  resetActiveWorkout: () => void;
  persistState: () => Promise<void>;
}

export const useActiveWorkoutStore = create<ActiveWorkoutStoreState>((set, get) => ({
  activeSession: null,
  exercises: [],
  currentExerciseIndex: 0,
  loggedSets: [],
  elapsedSeconds: 0,
  startedAtTimestamp: null,
  isTimerRunning: false,
  isLoggingSet: false,
  isCompleting: false,
  lastSummary: null,

  restTimer: {
    isActive: false,
    isPaused: false,
    totalSeconds: 0,
    remainingSeconds: 0,
  },
  isRestCompleted: false,
  dismissRestCompleted: () => set({ isRestCompleted: false }),

  activePR: null,
  achievedPRs: [],
  hasRecoverableSession: false,

  checkForRecoverableSession: async () => {
    try {
      const raw = await AsyncStorage.getItem(ACTIVE_WORKOUT_PERSIST_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.activeSession) {
          set({ hasRecoverableSession: true });
          return true;
        }
      }
      set({ hasRecoverableSession: false });
      return false;
    } catch {
      set({ hasRecoverableSession: false });
      return false;
    }
  },

  recoverSession: async () => {
    try {
      const raw = await AsyncStorage.getItem(ACTIVE_WORKOUT_PERSIST_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const now = Date.now();
        const startedAt = parsed.startedAtTimestamp || (now - (parsed.elapsedSeconds || 0) * 1000);
        const calculatedElapsed = Math.max(0, Math.floor((now - startedAt) / 1000));

        set({
          activeSession: parsed.activeSession,
          exercises: parsed.exercises || [],
          currentExerciseIndex: parsed.currentExerciseIndex || 0,
          loggedSets: parsed.loggedSets || [],
          elapsedSeconds: calculatedElapsed,
          startedAtTimestamp: startedAt,
          isTimerRunning: true,
          isLoggingSet: false,
          achievedPRs: parsed.achievedPRs || [],
          hasRecoverableSession: false,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  persistState: async () => {
    const { activeSession, exercises, currentExerciseIndex, loggedSets, elapsedSeconds, startedAtTimestamp, achievedPRs } = get();
    if (activeSession) {
      const stateToPersist = {
        activeSession,
        exercises,
        currentExerciseIndex,
        loggedSets,
        elapsedSeconds,
        startedAtTimestamp,
        achievedPRs,
      };
      await AsyncStorage.setItem(ACTIVE_WORKOUT_PERSIST_KEY, JSON.stringify(stateToPersist));
    } else {
      await AsyncStorage.removeItem(ACTIVE_WORKOUT_PERSIST_KEY);
    }
  },

  startWorkoutFromTemplate: async (template, exercises) => {
    const { data: session } = await workoutSessionService.createSession(
      template.id,
      template.name
    );

    if (!session) return false;

    const startTimestamp = Date.now();

    set({
      activeSession: session,
      exercises,
      currentExerciseIndex: 0,
      loggedSets: [],
      elapsedSeconds: 0,
      startedAtTimestamp: startTimestamp,
      isTimerRunning: true,
      isLoggingSet: false,
      isCompleting: false,
      lastSummary: null,
      restTimer: {
        isActive: false,
        isPaused: false,
        totalSeconds: 0,
        remainingSeconds: 0,
      },
      activePR: null,
      achievedPRs: [],
      hasRecoverableSession: false,
    });

    await get().persistState();
    return true;
  },

  tickWorkoutTimer: () => {
    const { isTimerRunning, startedAtTimestamp, elapsedSeconds } = get();
    if (isTimerRunning && startedAtTimestamp) {
      // Anchored calculation prevents timer drift when phone is backgrounded/locked
      const realElapsed = Math.max(0, Math.floor((Date.now() - startedAtTimestamp) / 1000));
      set({ elapsedSeconds: realElapsed });
      // Periodically persist state every 10 seconds
      if (realElapsed % 10 === 0 && realElapsed !== elapsedSeconds) {
        get().persistState();
      }
    }
  },

  startRestTimer: (seconds: number) => {
    const total = Math.max(0, Math.min(seconds, 600));
    if (total <= 0) return;

    set({
      restTimer: {
        isActive: true,
        isPaused: false,
        totalSeconds: total,
        remainingSeconds: total,
      },
    });
  },

  pauseRestTimer: () => {
    const { restTimer } = get();
    if (restTimer.isActive) {
      set({ restTimer: { ...restTimer, isPaused: true } });
    }
  },

  resumeRestTimer: () => {
    const { restTimer } = get();
    if (restTimer.isActive) {
      set({ restTimer: { ...restTimer, isPaused: false } });
    }
  },

  skipRestTimer: () => {
    set({
      restTimer: {
        isActive: false,
        isPaused: false,
        totalSeconds: 0,
        remainingSeconds: 0,
      },
    });
  },

  tickRestTimer: () => {
    const { restTimer } = get();
    if (!restTimer.isActive || restTimer.isPaused) return;

    if (restTimer.remainingSeconds <= 1) {
      // Finished!
      set({
        restTimer: {
          isActive: false,
          isPaused: false,
          totalSeconds: 0,
          remainingSeconds: 0,
        },
        isRestCompleted: true,
      });

      // Sound and Haptic cues
      soundHapticService.triggerRestTimerFinished();
      soundHapticService.playTripleBeep();

      // Visual feedback auto-dismiss after 2 seconds
      setTimeout(() => {
        set({ isRestCompleted: false });
      }, 2000);
    } else {
      set({
        restTimer: {
          ...restTimer,
          remainingSeconds: restTimer.remainingSeconds - 1,
        },
      });
    }
  },

  completeSet: async (weight: number, reps: number) => {
    const { activeSession, exercises, currentExerciseIndex, loggedSets, achievedPRs, isLoggingSet } = get();
    if (!activeSession || exercises.length === 0 || isLoggingSet) return null;

    const currentExercise = exercises[currentExerciseIndex];
    if (!currentExercise) return null;

    // Lock to prevent duplicate Complete Set on fast taps
    set({ isLoggingSet: true });

    try {
      // Hitung set number untuk exercise saat ini
      const exerciseSets = loggedSets.filter(
        (s) => s.exercise_id === currentExercise.exercise_id
      );
      const setNumber = exerciseSets.length + 1;

      // 1. Check for Weight PR: PR ONLY IF previousBest > 0 and weight > previousBest
      const previousBest = await workoutSessionService.getExerciseBestWeight(
        currentExercise.exercise_id
      );

      let isNewPR = false;
      let prItem: PRAchievement | null = null;

      if (previousBest > 0 && weight > previousBest) {
        isNewPR = true;
        prItem = {
          exerciseId: currentExercise.exercise_id,
          exerciseName: currentExercise.exercise?.name || "Exercise",
          previousWeight: previousBest,
          newWeight: weight,
        };
      }

      const { data: newSet } = await workoutSessionService.logSet({
        session_id: activeSession.id,
        exercise_id: currentExercise.exercise_id,
        set_number: setNumber,
        weight,
        reps,
      });

      if (newSet) {
        const updatedSets = [...loggedSets, newSet];
        const updatedPRs = isNewPR && prItem ? [...achievedPRs, prItem] : achievedPRs;

        set({
          loggedSets: updatedSets,
          activePR: prItem,
          achievedPRs: updatedPRs,
          isLoggingSet: false,
        });

        // Trigger Set Complete Haptic
        soundHapticService.triggerSetComplete();

        // Start auto Rest Timer using rest_timer_seconds configured in builder
        const restDuration = currentExercise.rest_timer_seconds ?? 90;
        get().startRestTimer(restDuration);

        await get().persistState();
        return newSet;
      }

      set({ isLoggingSet: false });
      return null;
    } catch {
      set({ isLoggingSet: false });
      return null;
    }
  },

  dismissPR: () => {
    set({ activePR: null });
  },

  nextExercise: () => {
    const { currentExerciseIndex, exercises } = get();
    if (currentExerciseIndex < exercises.length - 1) {
      set({ currentExerciseIndex: currentExerciseIndex + 1 });
      get().persistState();
    }
  },

  prevExercise: () => {
    const { currentExerciseIndex } = get();
    if (currentExerciseIndex > 0) {
      set({ currentExerciseIndex: currentExerciseIndex - 1 });
      get().persistState();
    }
  },

  finishWorkout: async () => {
    const { activeSession, elapsedSeconds, loggedSets, achievedPRs } = get();
    if (!activeSession) return null;

    set({ isCompleting: true, isTimerRunning: false });

    // Cancel rest timer
    get().skipRestTimer();

    const totalSets = loggedSets.length;
    const totalVolume = Number(
      loggedSets.reduce((acc, curr) => acc + curr.volume, 0).toFixed(2)
    );

    await workoutSessionService.completeSession(
      activeSession.id,
      elapsedSeconds,
      totalVolume,
      totalSets
    );

    const summary: WorkoutSummary = {
      durationSeconds: elapsedSeconds,
      totalSets,
      totalVolume,
      newPRs: achievedPRs,
    };

    set({
      lastSummary: summary,
      isCompleting: false,
    });

    // Workout Complete Haptic feedback
    soundHapticService.triggerWorkoutComplete();

    // Clear saved active workout session
    await AsyncStorage.removeItem(ACTIVE_WORKOUT_PERSIST_KEY);

    return summary;
  },

  discardWorkout: async () => {
    const { activeSession } = get();
    if (activeSession) {
      await workoutSessionService.discardSession(activeSession.id);
    }
    await AsyncStorage.removeItem(ACTIVE_WORKOUT_PERSIST_KEY);
    get().resetActiveWorkout();
  },

  resetActiveWorkout: () => {
    set({
      activeSession: null,
      exercises: [],
      currentExerciseIndex: 0,
      loggedSets: [],
      elapsedSeconds: 0,
      isTimerRunning: false,
      isCompleting: false,
      lastSummary: null,
      restTimer: {
        isActive: false,
        isPaused: false,
        totalSeconds: 0,
        remainingSeconds: 0,
      },
      activePR: null,
      achievedPRs: [],
      hasRecoverableSession: false,
    });
  },
}));
