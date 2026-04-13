import { WindowProps } from '@nameless-os/sdk';
import { create } from 'zustand';

interface WindowStoreState {
  windows: WindowProps[];
  setWindows: (windows: WindowProps[]) => void;
}

export const useWindowManagerStore = create<WindowStoreState>((set) => ({
  windows: [],
  setWindows: (windows) => set({ windows }),
}));