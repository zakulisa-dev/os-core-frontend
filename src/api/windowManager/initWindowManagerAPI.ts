import { WindowManager } from './windowMaanger';
import { EventBusApiImpl } from '../eventBus/eventBus.api-impl';

export function initWindowManagerAPI(eventBus: EventBusApiImpl) {
  return new WindowManager(eventBus);
}
