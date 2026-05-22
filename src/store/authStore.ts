import { create } from "zustand";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type Unsubscribe,
  type User,
  type UserCredential,
} from "firebase/auth";
import { auth } from "../lib/firebase";

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  authUnsubscribe: Unsubscribe | null;
  initialize: () => void;
  signInWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  authUnsubscribe: null,
  initialize: () => {
    const { authUnsubscribe } = get();
    if (authUnsubscribe) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ user, loading: false, initialized: true });
    });

    set({
      authUnsubscribe: unsubscribe,
      initialized: true,
      loading: true,
    });
  },
  signInWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  },
  logout: async () => {
    await signOut(auth);
  },
}));
