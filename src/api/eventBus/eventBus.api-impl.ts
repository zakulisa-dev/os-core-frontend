import { EventBusAPI, EventCallback } from '@nameless-os/sdk';

export class EventBusApiImpl implements EventBusAPI {
  private listeners = new Map<string, Set<EventCallback>>();
  private onceListeners = new Map<string, Set<EventCallback>>();

  sub<T = unknown>(event: string, callback: EventCallback<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);
  }

  unsub<T = unknown>(event: string, callback: EventCallback<T>): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback as EventCallback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }

    const onceCallbacks = this.onceListeners.get(event);
    if (onceCallbacks) {
      onceCallbacks.delete(callback as EventCallback);
      if (onceCallbacks.size === 0) {
        this.onceListeners.delete(event);
      }
    }
  }

  emit<T = unknown>(event: string, payload: T): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      for (const callback of callbacks) {
        try {
          callback(payload);
        } catch (error) {
          console.error(`EventBus error for "${event}":`, error);
        }
      }
    }

    const onceCallbacks = this.onceListeners.get(event);
    if (onceCallbacks) {
      const callbacksToExecute = Array.from(onceCallbacks);
      this.onceListeners.delete(event);

      for (const callback of callbacksToExecute) {
        try {
          callback(payload);
        } catch (error) {
          console.error(`EventBus once error for "${event}":`, error);
        }
      }
    }
  }

  once<T = unknown>(event: string, callback: EventCallback<T>): void {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set());
    }
    this.onceListeners.get(event)!.add(callback as EventCallback);
  }

  clear(event?: string): void {
    if (event) {
      this.listeners.delete(event);
      this.onceListeners.delete(event);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
  }

  hasListeners(event: string): boolean {
    const hasRegular = this.listeners.has(event) && this.listeners.get(event)!.size > 0;
    const hasOnce = this.onceListeners.has(event) && this.onceListeners.get(event)!.size > 0;
    return hasRegular || hasOnce;
  }
}