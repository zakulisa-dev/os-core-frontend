import { ToDo } from './ToDo';
import { AppInstanceId, CoreAPI, createPersistentAppTypeId, registerExternalApp } from '@nameless-os/sdk';

const PERSISTENT_APP_TYPE_ID = createPersistentAppTypeId('to_do');

function registerToDoApp(systemApi: CoreAPI) {
  const { appId, apis } = registerExternalApp({
    name: 'To Do',
    persistentAppTypeId: PERSISTENT_APP_TYPE_ID,
    icon: '/assets/images/icons/toDo.svg',
    launch: async (instanceId: AppInstanceId) => {
      systemApi.windowManager.openWindow({
        title: 'To Do',
        appInstanceId: instanceId,
        size: { width: 900, height: 600 },
        component: () => <ToDo instanceId={instanceId} />,
      });
    },
  });

  return appId;
}

export { registerToDoApp };
