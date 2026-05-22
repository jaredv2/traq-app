import { useEffect, useMemo } from "react";
import { useAuth } from "./useAuth";
import { useHabitsStore } from "../store/habitsStore";
import { isScheduledForDate } from "../lib";

export function useHabits() {
  const { user } = useAuth();
  const habits = useHabitsStore((state) => state.habits);
  const checkInsMap = useHabitsStore((state) => state.checkInsByTracker);
  const loading = useHabitsStore((state) => state.loading);
  const error = useHabitsStore((state) => state.error);
  const currentUid = useHabitsStore((state) => state.currentUid);
  const reset = useHabitsStore((state) => state.reset);
  const fetchHabits = useHabitsStore((state) => state.fetchHabits);
  const toggleHabitInStore = useHabitsStore((state) => state.toggleHabit);

  useEffect(() => {
    if (!user?.uid) {
      reset(undefined);
      return;
    }

    if (currentUid !== user.uid) {
      reset(user.uid);
    }

    void fetchHabits(user.uid);
  }, [currentUid, fetchHabits, reset, user?.uid]);

  const todayHabits = useMemo(
    () => habits.filter((habit) => isScheduledForDate(habit.frequency)),
    [habits],
  );

  const toggleHabit = async (id: string, note?: string) => {
    if (!user?.uid) return;
    await toggleHabitInStore(user.uid, id, note);
  };

  return {
    habits,
    todayHabits,
    checkInsMap,
    loading,
    error,
    refresh: () => (user?.uid ? fetchHabits(user.uid) : Promise.resolve()),
    toggleHabit,
  };
}
