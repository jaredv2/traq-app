import { create } from "zustand";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { type Tracker, type User } from "../lib";

export interface OnboardingData {
  name: string;
  focusAreas: string[];
  firstHabit: string;
  frequency: string;
  reminderTime: string;
  reminderEnabled: boolean;
}

export const TOTAL_STEPS = 4;

const initialOnboardingData: OnboardingData = {
  name: "",
  focusAreas: [],
  firstHabit: "",
  frequency: "0 0 * * *",
  reminderTime: "08:00",
  reminderEnabled: true,
};

interface CompleteOnboardingArgs {
  uid: string;
  focusAreas: { id: string; icon: string; label: string }[];
}

interface OnboardingState {
  step: number;
  loading: boolean;
  data: OnboardingData;
  reset: () => void;
  updateData: (patch: Partial<OnboardingData>) => void;
  next: () => void;
  back: () => void;
  canNext: () => boolean;
  complete: (args: CompleteOnboardingArgs) => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  step: 1,
  loading: false,
  data: initialOnboardingData,
  reset: () =>
    set({
      step: 1,
      loading: false,
      data: initialOnboardingData,
    }),
  updateData: (patch) =>
    set((state) => ({
      data: {
        ...state.data,
        ...patch,
      },
    })),
  next: () =>
    set((state) => ({
      step: Math.min(TOTAL_STEPS, state.step + 1),
    })),
  back: () =>
    set((state) => ({
      step: Math.max(1, state.step - 1),
    })),
  canNext: () => {
    const { step, data } = get();
    if (step === 1) return data.name.trim().length > 0;
    if (step === 2) return data.focusAreas.length > 0;
    if (step === 3) return data.firstHabit.trim().length > 0;
    return true;
  },
  complete: async ({ uid, focusAreas }) => {
    const { data } = get();
    set({ loading: true });

    try {
      const focusLabels = focusAreas.map((area) => area.label);
      const emoji = focusAreas[0]?.icon ?? "✨";

      const userRef = doc(db, "users", uid);
      const userData: User = {
        uid,
        name: data.name,
        hobbies: data.focusAreas,
        habits: [data.firstHabit],
        defaultFrequencySetup: data.frequency,
        createdAt: Timestamp.now(),
        plan: "free",
        streak: 0,
      };
      await setDoc(userRef, userData);

      const trackerRef = doc(collection(db, "trackers"));
      const trackerData: Tracker = {
        id: trackerRef.id,
        accId: uid,
        name: data.firstHabit,
        description: `My first habit focused on ${focusLabels.join(", ")}`,
        frequency: data.frequency,
        emoji,
        remindTime: data.reminderEnabled ? data.reminderTime : "",
        acceptNote: true,
        note: "",
        streak: 0,
        trackField: "Check-in",
        calendar: {},
        themeSetup: {
          accentColor: "#3b82f6",
          primaryColor: "#3b82f6",
          font: "DM Sans",
          backgroundImage: null,
        },
      };
      await setDoc(trackerRef, trackerData);

      set({ loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
}));
