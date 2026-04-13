import { registerExternalApp, AppInstanceId, createPersistentAppTypeId, CoreAPI } from '@nameless-os/sdk';
import { TextEditor } from '@Apps/textEditor/ui/TextEditor';

const PERSISTENT_APP_TYPE_ID = createPersistentAppTypeId('text_editor');

function registerTextEditorApp(systemApi: CoreAPI) {
  const { apis, appId } = registerExternalApp<{ filePath: string }>({
    name: 'Text Editor',
    persistentAppTypeId: PERSISTENT_APP_TYPE_ID,
    icon: '/assets/images/icons/textEditor.svg',
    fileAssociations: ['txt', 'tsx', 'jsx', 'js', 'ts', 'json'],
    launch: async (instanceId: AppInstanceId, data) => {
      apis.windowManager.openWindow({
        title: 'Text Editor',
        appInstanceId: instanceId,
        size: { width: 900, height: 600 },
        component: () => <TextEditor filePath={data?.filePath} />,
      });
    },
  });

  return appId;
}

export { registerTextEditorApp };
