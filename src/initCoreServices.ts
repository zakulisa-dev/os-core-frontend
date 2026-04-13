import { AchievementAPI, CoreAPI, EventBusAPI } from '@nameless-os/sdk';
import { initSound } from '@Features/sound/initSound';
import { initTerminal } from '@Apps/terminal/initTerminal';
import { initAppAPI } from './api/app/initAppAPI';
import { initWindowManagerAPI } from './api/windowManager/initWindowManagerAPI';
import { initFsAPI } from './api/fs/initFsAPI';
import { initAchievement } from './api/achievement/achievement.init';
import { initEventBusApi } from './api/eventBus/initEventBusApi';
import { customDIContainer } from './customDIContainer';
import { initNotification } from './api/notification/initNotification';

export function registerServices(): void {
  customDIContainer.register<EventBusAPI>(
    'eventBus',
    initEventBusApi,
    []
  );

  customDIContainer.register(
    'fileSystem',
    initFsAPI,
    []
  );

  customDIContainer.register(
    'sound',
    initSound,
    []
  );

  customDIContainer.register<AchievementAPI>(
    'achievement',
    initAchievement,
    ['eventBus', 'fileSystem', 'notification', 'sound']
  );

  customDIContainer.register(
    'app',
    initAppAPI,
    ['eventBus']
  );

  customDIContainer.register(
    'windowManager',
    initWindowManagerAPI,
    ['eventBus']
  );

  customDIContainer.register(
    'terminal',
    initTerminal,
    ['fileSystem', 'achievement', 'sound']
  );

  customDIContainer.register(
    'notification',
    initNotification,
    []
  );
}

async function initCoreServices(): Promise<CoreAPI> {
  try {
    registerServices();

    console.log('📊 Services to initialize:');
    console.table(customDIContainer.getStatus());

    const api = await customDIContainer.initializeAll();

    console.log('🎯 WebOS Core Services ready!');
    console.log('📊 Final status:');
    console.table(customDIContainer.getStatus());
    return api as unknown as CoreAPI;
  } catch (error) {
    console.error('❌ Failed to initialize WebOS services:', error);
    throw error;
  }
}

export { initCoreServices };
