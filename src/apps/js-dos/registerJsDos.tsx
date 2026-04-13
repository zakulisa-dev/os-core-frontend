import { AppInstanceId, CoreAPI, createPersistentAppTypeId, registerExternalApp } from '@nameless-os/sdk';
import { JSDosEmulator } from './ui/jsDos';

const PERSISTENT_APP_TYPE_ID = createPersistentAppTypeId('jsdos');

interface JSDosLaunchParams {
  executablePath?: string;
  gameTitle?: string;
  dosboxConfig?: string;
}

function registerJSDosApp(systemApi: CoreAPI) {
  const { appId } = registerExternalApp({
    name: 'JS-DOS',
    persistentAppTypeId: PERSISTENT_APP_TYPE_ID,
    icon: '/assets/images/icons/msdos.svg',
    fileAssociations: ['jsdos'],
    launch: async (instanceId: AppInstanceId, launchParams?: JSDosLaunchParams) => {
      const windowTitle = launchParams?.gameTitle || 'JS-DOS';

      systemApi.windowManager.openWindow({
        title: windowTitle,
        appInstanceId: instanceId,
        size: { width: 800, height: 600 },
        minSize: { width: 320, height: 240 },
        component: () => (
          <JSDosEmulator
            executablePath={launchParams?.executablePath}
            gameTitle={launchParams?.gameTitle}
            dosboxConfig={launchParams?.dosboxConfig}
            systemApi={systemApi}
          />
        ),
      });
    },
  });

  return appId;
}

export { registerJSDosApp };