import { EventBusApiImpl } from './eventBus.api-impl';

export function initEventBusApi() {
  return new EventBusApiImpl();
}