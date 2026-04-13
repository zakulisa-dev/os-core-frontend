import { AppInstanceId } from '@nameless-os/sdk';

export class SessionStorageManager {
  private storage: Record<AppInstanceId, Record<string, unknown>> = {};

  getStorageForInstance(instanceId: AppInstanceId) {
    if (!this.storage[instanceId]) {
      this.storage[instanceId] = {};
    }

    return {
      get: <T>(key: string): T | undefined => {
        const value = this.storage[instanceId]?.[key];
        return value as T | undefined;
      },

      set: <T>(key: string, value: T): void => {
        if (!this.storage[instanceId]) {
          this.storage[instanceId] = {};
        }
        this.storage[instanceId][key] = value;
      },

      remove: (key: string): void => {
        if (this.storage[instanceId]) {
          delete this.storage[instanceId][key];
        }
      },

      clear: (): void => {
        if (this.storage[instanceId]) {
          this.storage[instanceId] = {};
        }
      },

      has: (key: string): boolean => {
        return this.storage[instanceId]?.hasOwnProperty(key) ?? false;
      },
    };
  }

  clearInstance(instanceId: AppInstanceId): void {
    delete this.storage[instanceId];
  }

  getKeys(instanceId: AppInstanceId): string[] {
    return Object.keys(this.storage[instanceId] || {});
  }

  getSize(instanceId: AppInstanceId): number {
    return this.getKeys(instanceId).length;
  }

  hasInstance(instanceId: AppInstanceId): boolean {
    return this.storage[instanceId] !== undefined;
  }

  getActiveInstances(): AppInstanceId[] {
    return Object.keys(this.storage);
  }

  clearAll(): void {
    this.storage = {};
  }

  getStats(): Record<AppInstanceId, { keys: number; size: string }> {
    const stats: Record<AppInstanceId, { keys: number; size: string }> = {};

    Object.entries(this.storage).forEach(([instanceId, data]) => {
      const keys = Object.keys(data).length;
      const size = this.estimateSize(data);
      stats[instanceId] = { keys, size };
    });

    return stats;
  }

  private estimateSize(obj: unknown): string {
    const str = JSON.stringify(obj);
    const bytes = new Blob([str]).size;

    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  }
}
