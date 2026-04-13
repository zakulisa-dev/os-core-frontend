import { AppInstanceId, CoreAPI, createPersistentAppTypeId, registerExternalApp } from '@nameless-os/sdk';
import { BullsAndCows } from '@Apps/bullsAndCows/ui/BullsAndCows';

const PERSISTENT_APP_TYPE_ID = createPersistentAppTypeId('bulls_and_cows');

function registerBullsAndCowsApp(systemApi: CoreAPI) {
  const { appId } = registerExternalApp({
    name: 'Bulls and Cows',
    persistentAppTypeId: PERSISTENT_APP_TYPE_ID,
    icon: '/assets/images/icons/cow.svg',
    launch: async (instanceId: AppInstanceId) => {
      systemApi.windowManager.openWindow({
        title: 'Bulls and Cows',
        appInstanceId: instanceId,
        size: { width: 900, height: 600 },
        component: () => <BullsAndCows instanceId={instanceId}/>,
      });
    },
  });

  return appId;
}

export { registerBullsAndCowsApp };
