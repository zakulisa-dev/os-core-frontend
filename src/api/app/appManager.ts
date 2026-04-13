import {
  AppAPI, AppDefinition,
  AppId,
  AppInstance,
  AppInstanceId,
  createInstanceId,
  EventBusAPI, Nullable,
} from '@nameless-os/sdk';
import { v4 as uuidv4 } from 'uuid';
import { useRegisteredAppsStore } from './appDefinitons.store';
import { useAppsInstancesStore } from './appsInstances.store';
import i18n from 'i18next';
import { fileRegistry } from './fileAssociations';

class AppManagerAPI implements AppAPI {
  private readonly eventBus: EventBusAPI;

  constructor(eventBus: EventBusAPI) {
    this.eventBus = eventBus;
  }

  registerApp(app: AppDefinition): Nullable<AppId> {
    if (useRegisteredAppsStore.getState().getAppByPersistentAppId(app.persistentAppTypeId)) {
      return null;
    }
    if (app.translations) {
      Object.keys(app.translations).forEach(lng => {
        i18n.addResourceBundle(lng, app.persistentAppTypeId, app.translations![lng]);
      });
    }
    const appId = useRegisteredAppsStore.getState().registerApp(app);
    if (app.fileAssociations) {
      fileRegistry.registerAssociation(app.fileAssociations, appId)
    }
    return appId;
  }

  startApp<T>(appId: AppId, data?: T): AppInstanceId {
    const registeredApp = useRegisteredAppsStore.getState().getApp(appId);
    if (!registeredApp) throw new Error(`App ${appId} not found`);

    const instanceId: AppInstanceId = createInstanceId(uuidv4());
    const { addInstance } = useAppsInstancesStore.getState();

    const instance: AppInstance = {
      id: instanceId,
      persistentAppTypeId: registeredApp.persistentAppTypeId,
      appId,
      startedAt: new Date(),
    };

    addInstance(instance);
    registeredApp.launch(instanceId, data as never); // TODO: fix type

    return instanceId;
  }

  async stopApp(instanceId: AppInstanceId): Promise<void> {
    useAppsInstancesStore.getState().removeInstance(instanceId);
    this.eventBus.emit('app:closed', { instanceId });
  }

  getAppInstances(appId: AppId): AppInstance[] {
    return useAppsInstancesStore.getState().getAll().filter((app) => app.appId === appId);
  }

  getRunningApps(): AppInstance[] {
    return useAppsInstancesStore.getState().getAll();
  }

  isAppRunning(appId: AppId): boolean {
    return useAppsInstancesStore
      .getState()
      .getAll()
      .some((i) => i.appId === appId);
  }
}

export { AppManagerAPI };
