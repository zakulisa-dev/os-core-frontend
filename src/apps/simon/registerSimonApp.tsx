import { AppInstanceId, CoreAPI, createPersistentAppTypeId, registerExternalApp } from '@nameless-os/sdk';
import { Simon } from '@Simon/Simon';
import { useSimonStore } from '@Simon/stores/simon.store';

const PERSISTENT_APP_TYPE_ID = createPersistentAppTypeId('simon');

function registerSimonApp(systemApi: CoreAPI) {
  const { appId, apis } = registerExternalApp({
    name: 'Simon',
    persistentAppTypeId: PERSISTENT_APP_TYPE_ID,
    icon: '/assets/images/icons/simon.svg',
    launch: async (instanceId: AppInstanceId) => {
      useSimonStore.getState().init(instanceId);
      systemApi.windowManager.openWindow({
        title: 'Simon',
        appInstanceId: instanceId,
        size: { width: 900, height: 600 },
        component: () => <Simon instanceId={instanceId} />,
      });
    },
  });

  return appId;
}

export { registerSimonApp };
