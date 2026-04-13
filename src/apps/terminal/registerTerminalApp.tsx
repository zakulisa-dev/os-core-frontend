import { Terminal } from '@Apps/terminal/ui/Terminal';
import { useTerminalStore } from '@Apps/terminal/stores/useTerminal.store';
import { AppInstanceId, CoreAPI, createPersistentAppTypeId, registerExternalApp } from '@nameless-os/sdk';

const PERSISTENT_APP_TYPE_ID = createPersistentAppTypeId('terminal');

function registerTerminalApp(systemApi: CoreAPI) {
  const { appId } = registerExternalApp({
    name: 'Terminal',
    persistentAppTypeId: PERSISTENT_APP_TYPE_ID,
    icon: '/assets/images/icons/terminal.svg',
    launch: async (instanceId: AppInstanceId) => {
      systemApi.windowManager.openWindow({
        title: 'Terminal',
        appInstanceId: instanceId,
        size: { width: 900, height: 600 },
        component: () => <Terminal appId={instanceId}/>,
      });
      useTerminalStore.getState().init(instanceId);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      systemApi.achievement.updateProgress('terminal_first_use', 1);
    },
  });

  return appId;
}

export { registerTerminalApp };
