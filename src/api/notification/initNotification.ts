import { NotificationAPIImpl } from './notification.api-impl';

function initNotification() {
  return new NotificationAPIImpl();
}

export { initNotification };
