// store/uiStore.ts — Zustand UI state
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  homeSidebarCollapsed: boolean;
  toggleHomeSidebar: () => void;

  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      homeSidebarCollapsed: false,
      toggleHomeSidebar: () =>
        set((s) => ({ homeSidebarCollapsed: !s.homeSidebarCollapsed })),

      mobileDrawerOpen: false,
      setMobileDrawerOpen: (open) => set({ mobileDrawerOpen: open }),
    }),
    {
      name: "traq-ui",
      // Only persist sidebar collapsed state, not the drawer (always closed on load)
      partialize: (s) => ({ homeSidebarCollapsed: s.homeSidebarCollapsed }),
    }
  )
);