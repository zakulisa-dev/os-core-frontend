import { create } from 'zustand';

interface UserStore {
  isGuestMode: boolean;
  setGuestMode: (value: boolean) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  isGuestMode: false,
  setGuestMode: (value) => set({ isGuestMode: value }),
}));