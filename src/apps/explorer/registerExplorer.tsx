import { AppInstanceId, CoreAPI, createPersistentAppTypeId, registerExternalApp } from '@nameless-os/sdk';
import { FileExplorer } from '@Apps/explorer/FileExplorer';

const PERSISTENT_APP_TYPE_ID = createPersistentAppTypeId('explorer');

function registerExplorerApp(systemApi: CoreAPI) {
  const { appId } = registerExternalApp({
    name: 'Explorer',
    persistentAppTypeId: PERSISTENT_APP_TYPE_ID,
    icon: '/assets/images/icons/explorer.svg',
    launch: async (instanceId: AppInstanceId) => {
      systemApi.windowManager.openWindow({
        title: 'Explorer',
        appInstanceId: instanceId,
        size: { width: 900, height: 600 },
        component: () => <FileExplorer/>,
      });
    },
  });

  return appId;
}

export { registerExplorerApp };
