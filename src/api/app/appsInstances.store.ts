import { create } from 'zustand';
import { AppInstance, AppInstanceId } from '@nameless-os/sdk';

interface RunningAppsState {
  instances: Record<AppInstanceId, AppInstance>;
  addInstance: (instance: AppInstance) => void;
  removeInstance: (id: AppInstanceId) => void;
  getAll: () => AppInstance[];
  getInstance: (id: AppInstanceId) => AppInstance;
}

export const useAppsInstancesStore = create<RunningAppsState>((set, get) => ({
  instances: {},

  addInstance: (instance) => {
    set((state) => ({
      instances: {
        ...state.instances,
        [instance.id]: instance,
      },
    }));
  },

  removeInstance: (id) => {
    set((state) => {
      const updated = { ...state.instances };
      delete updated[id];
      return { instances: updated };
    });
  },

  getInstance: (id) => {
    return get().instances[id];
  },

  getAll: () => Object.values(get().instances),
}));