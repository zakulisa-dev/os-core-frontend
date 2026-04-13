import { create } from 'zustand';
import { AppDefinition, AppId, createAppId } from '@nameless-os/sdk';
import { v4 as uuidv4 } from 'uuid';

type App = AppDefinition & { appId: AppId };

interface RegisteredAppsState {
  apps: Record<AppId, App>;
  registerApp: (app: AppDefinition) => AppId;
  getApp: (id: AppId) => App | undefined;
  getAppByPersistentAppId: (persistentAppTypeId: string) => App | undefined;
}

export const useRegisteredAppsStore = create<RegisteredAppsState>((set, get) => ({
  apps: {},

  registerApp: (app) => {
    const appId: AppId = createAppId(uuidv4());
    set((state) => ({
      apps: {
        ...state.apps,
        [appId]: { ...app, appId },
      },
    }));

    return appId;
  },

  getApp: (appId) => get().apps[appId],

  getAppByPersistentAppId: (persistentAppTypeId) => Object.values(get().apps).find((app) => app.persistentAppTypeId === persistentAppTypeId),
}));