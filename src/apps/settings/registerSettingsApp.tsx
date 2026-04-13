import { Settings } from './Settings';
import { AppInstanceId, CoreAPI, createPersistentAppTypeId, registerExternalApp } from '@nameless-os/sdk';

const PERSISTENT_APP_TYPE_ID = createPersistentAppTypeId('settings');

function registerSettingsApp(systemApi: CoreAPI) {
  const { appId } = registerExternalApp({
    name: 'Settings',
    persistentAppTypeId: PERSISTENT_APP_TYPE_ID,
    icon: '/assets/images/icons/settings.svg',
    launch: async (instanceId: AppInstanceId) => {
      systemApi.windowManager.openWindow({
        title: 'Settings',
        appInstanceId: instanceId,
        size: { width: 900, height: 600 },
        component: () => <Settings appId={instanceId} />,
      });
    },
  });

  return appId;
}

export { registerSettingsApp };
