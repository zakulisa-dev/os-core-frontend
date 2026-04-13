import { AppInstanceId, CoreAPI, createPersistentAppTypeId, registerExternalApp } from '@nameless-os/sdk';
import { Calculator } from '@Calculator/Calculator';
import { useCalculatorStore } from '@Calculator/stores/calculator.store';

const PERSISTENT_APP_TYPE_ID = createPersistentAppTypeId('calculator');

function registerCalculatorApp(systemApi: CoreAPI) {
  const { appId } = registerExternalApp({
    name: 'Calculator',
    persistentAppTypeId: PERSISTENT_APP_TYPE_ID,
    icon: '/assets/images/icons/calculator.svg',
    launch: async (instanceId: AppInstanceId) => {
      systemApi.windowManager.openWindow({
        title: 'Calculator',
        appInstanceId: instanceId,
        size: { width: 900, height: 600 },
        component: () => <Calculator instanceId={instanceId}/>,
      });
      useCalculatorStore.getState().init(instanceId);
    },
  });

  return appId;
}

export { registerCalculatorApp };
