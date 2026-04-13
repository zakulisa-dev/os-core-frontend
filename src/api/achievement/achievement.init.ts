import { AchievementApiImpl } from './achievement.api-impl';
import { EventBusAPI, FileSystemAPI, NotificationAPI, SoundAPI } from '@nameless-os/sdk';

export function initAchievement(eventBus: EventBusAPI, fs: FileSystemAPI, notificationApi: NotificationAPI, soundApi: SoundAPI) {
  return new AchievementApiImpl(notificationApi, eventBus, soundApi, fs);
}
