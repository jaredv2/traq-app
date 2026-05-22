import { create } from "zustand";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { type Tracker } from "../lib";

const todayISO = (): string => new Date().toISOString().slice(0, 10);

interface HabitsState {
  habits: Tracker[];
  loading: boolean;
  error: string | null;
  currentUid?: string;
  reset: (uid?: string) => void;
  fetchHabits: (uid: string) => Promise<void>;
  toggleHabit: (uid: string, id: string) => Promise<void>;
}

const initialState = {
  habits: [] as Tracker[],
  loading: false,
  error: null as string | null,
};

export const useHabitsStore = create<HabitsState>((set, get) => ({
  ...initialState,
  currentUid: undefined,
  reset: (uid) =>
    set({
      ...initialState,
      loading: Boolean(uid),
      currentUid: uid,
    }),
  fetchHabits: async (uid) => {
    const { currentUid } = get();
    if (currentUid !== uid) {
      set({ ...initialState, loading: true, currentUid: uid });
    } else {
      set({ loading: true, error: null });
    }

    try {
      const trackersCol = collection(db, "trackers");
      const habitsQuery = query(trackersCol, where("accId", "==", uid));
      const snap = await getDocs(habitsQuery);
      const habits = snap.docs.map(
        (habitDoc) =>
          ({
            ...habitDoc.data(),
            id: habitDoc.id,
          }) as Tracker,
      );

      if (get().currentUid !== uid) return;
      set({ habits, loading: false, error: null });
    } catch (error) {
      console.error("Error fetching habits:", error);
      if (get().currentUid !== uid) return;
      set({
        error: "Couldn't load habits. Please check your connection.",
        loading: false,
      });
    }
  },
  toggleHabit: async (uid, id) => {
    const { habits, currentUid } = get();
    if (currentUid !== uid) return;

    const habit = habits.find((item) => item.id === id);
    if (!habit) return;

    const todayKey = todayISO();
    const isDone = !!habit.calendar?.[todayKey];
    const newCalendar = { ...(habit.calendar || {}) };

    if (isDone) {
      delete newCalendar[todayKey];
    } else {
      newCalendar[todayKey] = 1;
    }

    const nextStreak = !isDone
      ? (habit.streak || 0) + 1
      : Math.max(0, (habit.streak || 0) - 1);
    const previousHabits = habits;
    const nextHabits = habits.map((item) =>
      item.id === id
        ? {
            ...item,
            calendar: newCalendar,
            streak: nextStreak,
          }
        : item,
    );

    set({ habits: nextHabits });

    try {
      await updateDoc(doc(db, "trackers", id), {
        calendar: newCalendar,
        streak: nextStreak,
      });
    } catch (error) {
      console.error("Failed to update habit:", error);
      if (get().currentUid !== uid) return;
      set({ habits: previousHabits });
    }
  },
}));
