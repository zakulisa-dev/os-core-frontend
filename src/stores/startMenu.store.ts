import { create } from 'zustand';

interface UIStore {
  isStartMenuOpen: boolean;
  toggleStartMenu: () => void;
  closeStartMenu: () => void;
}

export const useStartMenu = create<UIStore>((set) => ({
  isStartMenuOpen: false,
  toggleStartMenu: () => set((s) => ({ isStartMenuOpen: !s.isStartMenuOpen })),
  closeStartMenu: () => set({ isStartMenuOpen: false }),
}));