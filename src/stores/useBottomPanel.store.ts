import { create } from 'zustand';

interface BottomPanelState {
  pinnedApps: string[];
  appOrder: string[];
  pinApp: (appId: string) => void;
  unpinApp: (appId: string) => void;
  isPinned: (appId: string) => boolean;
  moveApp: (fromIndex: number, toIndex: number) => void;
  setAppOrder: (order: string[]) => void;
}

export const useBottomPanelStore = create<BottomPanelState>((set, get) => ({
  pinnedApps: [],
  appOrder: [],

  pinApp: (appId) => {
    const { pinnedApps } = get();
    if (!pinnedApps.includes(appId)) {
      set({ pinnedApps: [...pinnedApps, appId] });
    }
  },

  unpinApp: (appId) => {
    set((state) => ({
      pinnedApps: state.pinnedApps.filter((id) => id !== appId),
    }));
  },

  isPinned: (appId) => {
    return get().pinnedApps.includes(appId);
  },

  moveApp: (from, to) => {
    const order = [...get().appOrder];
    const [moved] = order.splice(from, 1);
    order.splice(to, 0, moved);
    set({ appOrder: order });
  },

  setAppOrder: (order) => {
    set({ appOrder: order });
  },
}));
