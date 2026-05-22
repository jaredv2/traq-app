import { create } from "zustand";
import { collection, doc, increment, Timestamp, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";
import { TrackerModel, type TrackerFrequency, type User } from "../lib";

export interface OnboardingData {
  name: string;
  focusAreas: string[];
  firstHabit: string;
  frequency: TrackerFrequency;
  reminderTime: string;
  reminderEnabled: boolean;
}

export const TOTAL_STEPS = 4;

export const DEFAULT_FREQUENCY: TrackerFrequency = {
  period: "day",
  times: 1,
  specificDays: [],
  mode: "random",
};

const initialOnboardingData: OnboardingData = {
  name: "",
  focusAreas: [],
  firstHabit: "",
  frequency: DEFAULT_FREQUENCY,
  reminderTime: "08:00",
  reminderEnabled: true,
};

interface CompleteOnboardingArgs {
  uid: string;
  email: string;
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
  complete: async ({ uid, email, focusAreas }) => {
    const { data } = get();
    set({ loading: true });

    try {
      const trackerId = doc(collection(db, "trackers")).id;
      const userRef = doc(db, "users", uid);
      const trackerRef = doc(db, "trackers", trackerId);
      const batch = writeBatch(db);

      const userData: User = {
        uid,
        name: data.name,
        email,
        isPremium: false,
        trackerCount: 0,
        createdAt: Timestamp.now(),
      };

      const trackerData = TrackerModel.create({
        id: trackerId,
        ownerId: uid,
        name: data.firstHabit,
        icon: focusAreas[0]?.icon ?? "✨",
        color: "#3b82f6",
        unit: "check-ins",
        frequency: data.frequency,
        createdAt: Timestamp.now(),
        lastCheckIn: null,
      });

      batch.set(userRef, { ...userData, trackerCount: increment(1) }, { merge: true });
      batch.set(trackerRef, trackerData.toFirestore());
      await batch.commit();

      set({ loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
}));
