import { useAuthStore } from "../store/authStore";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const logout = useAuthStore((state) => state.logout);

  return {
    user,
    loading,
    signInWithGoogle,
    logout,
  };
}
