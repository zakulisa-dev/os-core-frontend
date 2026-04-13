import { AppInstanceId, CoreAPI, createPersistentAppTypeId, registerExternalApp } from '@nameless-os/sdk';
import { Achievements } from '@Apps/achievements/ui/Achievements';

const PERSISTENT_APP_TYPE_ID = createPersistentAppTypeId('achievements');

function registerAchievementsApp(systemApi: CoreAPI) {
  const { appId } = registerExternalApp({
    name: 'Achievements',
    persistentAppTypeId: PERSISTENT_APP_TYPE_ID,
    icon: '/assets/images/icons/achievements.svg',
    launch: async (instanceId: AppInstanceId) => {
      systemApi.windowManager.openWindow({
        title: 'Achievements',
        appInstanceId: instanceId,
        size: { width: 900, height: 600 },
        component: () => <Achievements achievementApi={systemApi.achievement} />,
      });
    },
  });

  return appId;
}

export { registerAchievementsApp };
