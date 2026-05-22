import { useEffect, useMemo } from "react";
import { useAuth } from "./useAuth";
import { useHabitsStore } from "../store/habitsStore";

export const isScheduledForToday = (frequency: string): boolean => {
  const day = new Date().getDay();
  const parts = frequency.split(" ");
  if (parts.length < 5) return true;

  const dayPart = parts[4];
  if (dayPart === "*") return true;
  if (dayPart === "1-5") return day >= 1 && day <= 5;
  if (dayPart === "0,6") return day === 0 || day === 6;

  const allowedDays = dayPart.split(",").map(Number);
  return allowedDays.includes(day);
};

export function useHabits() {
  const { user } = useAuth();
  const habits = useHabitsStore((state) => state.habits);
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
    () => habits.filter((habit) => isScheduledForToday(habit.frequency)),
    [habits],
  );

  const toggleHabit = async (id: string) => {
    if (!user?.uid) return;
    await toggleHabitInStore(user.uid, id);
  };

  return {
    habits,
    todayHabits,
    loading,
    error,
    refresh: () => (user?.uid ? fetchHabits(user.uid) : Promise.resolve()),
    toggleHabit,
  };
}
