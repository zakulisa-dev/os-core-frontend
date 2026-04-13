import { toast } from 'sonner';
import { NotificationAPI } from '@nameless-os/sdk';
import { NotificationOptions } from '@nameless-os/sdk/dist/api/notification/notification.api';

export class NotificationAPIImpl implements NotificationAPI {
  private notifications: Map<string, string | number> = new Map();
  private idCounter = 0;

  private generateId(): string {
    return `notification-${++this.idCounter}-${Date.now()}`;
  }

  notify(title: string, message: string, options?: NotificationOptions): string {
    const id = this.generateId();
    const type = options?.type || 'info';

    let toastId: string | number;

    const content = (
      <div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>
        <div style={{ opacity: 0.8 }}>{message}</div>
      </div>
    );

    switch (type) {
      case 'success':
        console.log(1);
        toastId = toast.success(content);
        console.log(toastId);
        break;
      case 'error':
        toastId = toast.error(content);
        break;
      case 'warning':
        toastId = toast.warning(content);
        break;
      case 'info':
      default:
        toastId = toast.info(content);
        break;
    }

    this.notifications.set(id, toastId);
    return id;
  }

  info(title: string, message: string): string {
    return this.notify(title, message, { type: 'info' });
  }

  success(title: string, message: string): string {
    return this.notify(title, message, { type: 'success' });
  }

  error(title: string, message: string): string {
    return this.notify(title, message, { type: 'error' });
  }

  warning(title: string, message: string): string {
    return this.notify(title, message, { type: 'warning' });
  }

  dismiss(id: string): void {
    const toastId = this.notifications.get(id);
    if (toastId) {
      toast.dismiss(toastId);
      this.notifications.delete(id);
    }
  }

  dismissAll(): void {
    toast.dismiss();
    this.notifications.clear();
  }

  getActive(): string[] {
    throw new Error('Method not implemented.');
  }
}