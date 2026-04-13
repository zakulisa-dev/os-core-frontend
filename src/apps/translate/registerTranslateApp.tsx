import { AppInstanceId, CoreAPI, createPersistentAppTypeId, registerExternalApp } from '@nameless-os/sdk';
import { Translate } from '@Translate/Translate';

const PERSISTENT_APP_TYPE_ID = createPersistentAppTypeId('translate');

function registerTranslateApp(systemApi: CoreAPI) {
  const { appId, apis } = registerExternalApp({
    name: 'Translate',
    persistentAppTypeId: PERSISTENT_APP_TYPE_ID,
    icon: '/assets/images/icons/translate.svg',
    launch: async (instanceId: AppInstanceId) => {
      systemApi.windowManager.openWindow({
        title: 'Translate',
        appInstanceId: instanceId,
        size: { width: 900, height: 600 },
        component: () => <Translate />,
      });
    },
  });

  return appId;
}

export { registerTranslateApp };
