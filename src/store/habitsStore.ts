import { create } from "zustand";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  calculateStreaks,
  type Tracker,
  type TrackerCheckIn,
  todayISO,
} from "../lib";

interface HabitsState {
  habits: Tracker[];
  checkInsByTracker: Record<string, Record<string, TrackerCheckIn>>;
  loading: boolean;
  error: string | null;
  currentUid?: string;
  reset: (uid?: string) => void;
  fetchHabits: (uid: string) => Promise<void>;
  toggleHabit: (uid: string, id: string, note?: string) => Promise<void>;
}

const initialState = {
  habits: [] as Tracker[],
  checkInsByTracker: {} as Record<string, Record<string, TrackerCheckIn>>,
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
      const habitsQuery = query(trackersCol, where("ownerId", "==", uid));
      const snap = await getDocs(habitsQuery);

      const checkInPairs = await Promise.all(
        snap.docs.map(async (trackerDoc) => {
          const checkInsSnap = await getDocs(collection(db, "trackers", trackerDoc.id, "checkIns"));
          const checkIns = checkInsSnap.docs.reduce<Record<string, TrackerCheckIn>>((acc, checkInDoc) => {
            acc[checkInDoc.id] = checkInDoc.data() as TrackerCheckIn;
            return acc;
          }, {});

          return [trackerDoc.id, checkIns] as const;
        }),
      );

      const checkInsByTracker = Object.fromEntries(checkInPairs);
      const habits = snap.docs.map((habitDoc) => {
        const tracker = {
          ...habitDoc.data(),
          id: habitDoc.id,
        } as Tracker;
        const checkIns = checkInsByTracker[habitDoc.id] ?? {};
        const streaks = calculateStreaks(checkIns);
        return {
          ...tracker,
          ...streaks,
        };
      });

      if (get().currentUid !== uid) return;
      set({ habits, checkInsByTracker, loading: false, error: null });
    } catch (error) {
      console.error("Error fetching habits:", error);
      if (get().currentUid !== uid) return;
      set({
        error: "Couldn't load trackers. Please check your connection.",
        loading: false,
      });
    }
  },
  toggleHabit: async (uid, id, note = "") => {
    const { habits, checkInsByTracker, currentUid } = get();
    if (currentUid !== uid) return;

    const habit = habits.find((item) => item.id === id);
    if (!habit) return;

    const todayKey = todayISO();
    const trackerCheckIns = checkInsByTracker[id] ?? {};
    const existingEntry = Object.entries(trackerCheckIns).find(([, checkIn]) => checkIn.date === todayKey);
    const nextCheckIns = { ...trackerCheckIns };

    if (existingEntry) {
      delete nextCheckIns[existingEntry[0]];
    } else {
      nextCheckIns[todayKey] = {
        date: todayKey,
        note,
        timestamp: Timestamp.now(),
      };
    }

    const streaks = calculateStreaks(nextCheckIns);
    const previousHabits = habits;
    const previousCheckIns = checkInsByTracker;
    const nextHabits = habits.map((item) =>
      item.id === id
        ? {
            ...item,
            ...streaks,
          }
        : item,
    );

    set({
      habits: nextHabits,
      checkInsByTracker: {
        ...checkInsByTracker,
        [id]: nextCheckIns,
      },
    });

    try {
      const checkInId = existingEntry?.[0] ?? todayKey;
      const checkInRef = doc(db, "trackers", id, "checkIns", checkInId);

      if (existingEntry) {
        await deleteDoc(checkInRef);
      } else {
        await setDoc(checkInRef, {
          date: todayKey,
          note,
          timestamp: Timestamp.now(),
        });
      }

      await updateDoc(doc(db, "trackers", id), {
        currentStreak: streaks.currentStreak,
        longestStreak: streaks.longestStreak,
        lastCheckIn: streaks.lastCheckIn,
      });
    } catch (error) {
      console.error("Failed to update tracker:", error);
      if (get().currentUid !== uid) return;
      set({ habits: previousHabits, checkInsByTracker: previousCheckIns });
    }
  },
}));
