import { Browser } from '@Apps/browser/ui/Browser';
import { registerExternalApp, AppInstanceId, createPersistentAppTypeId } from '@nameless-os/sdk';

const PERSISTENT_APP_TYPE_ID = createPersistentAppTypeId('browser');

function registerBrowserApp() {
  const { apis, appId } = registerExternalApp({
    name: 'Browser',
    persistentAppTypeId: PERSISTENT_APP_TYPE_ID,
    icon: '/assets/images/icons/browser.svg',
    launch: async (instanceId: AppInstanceId) => {
      apis.windowManager.openWindow({
        title: 'Browser',
        appInstanceId: instanceId,
        size: { width: 900, height: 600 },
        component: () => <Browser/>,
      });
    },
  });

  return appId;
}

export { registerBrowserApp };
