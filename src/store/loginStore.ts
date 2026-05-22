import { create } from "zustand";

interface LoginState {
  loading: boolean;
  error: string | null;
  start: () => void;
  fail: (message: string) => void;
  finish: () => void;
  reset: () => void;
}

export const useLoginStore = create<LoginState>((set) => ({
  loading: false,
  error: null,
  start: () => set({ loading: true, error: null }),
  fail: (message) => set({ loading: false, error: message }),
  finish: () => set({ loading: false }),
  reset: () => set({ loading: false, error: null }),
}));
