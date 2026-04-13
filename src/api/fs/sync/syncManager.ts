import { IDBFileNode, IndexedDBStorage } from '../storage/idbStorage';
import { CacheNode, ImprovedMemoryCache } from '../cache/improvedMemoryCache';
import { Nullable } from '@nameless-os/sdk';

export class SyncManager {
  private syncInterval: Nullable<number> = null;
  private isSync = false;

  constructor(
    private cache: ImprovedMemoryCache,
    private storage: IndexedDBStorage,
    private syncIntervalMs = 5000
  ) {}

  startAutoSync(): void {
    if (this.syncInterval) return;

    this.syncInterval = window.setInterval(() => {
      this.syncToStorage();
    }, this.syncIntervalMs);
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncToStorage(): Promise<void> {
    if (this.isSync) return;

    this.isSync = true;
    try {
      const dirtyPaths = this.cache.getDirtyNodes();

      for (const path of dirtyPaths) {
        const node = this.cache.get(path);
        if (node) {
          const idbNode: IDBFileNode = {
            id: path,
            path: node.path,
            name: node.name,
            type: node.type,
            parentPath: node.parentPath,
            content: node.content,
            created: node.created.getTime(),
            modified: node.modified.getTime(),
            permissions: node.permissions,
            size: node.size
          };

          await this.storage.setNode(idbNode);
          this.cache.clearDirty(path);
        }
      }
    } finally {
      this.isSync = false;
    }
  }

  async loadFromStorage(): Promise<void> {
    const nodes = await this.storage.getAllNodes();

    this.cache.clear();

    for (const idbNode of nodes) {
      const cacheNode: CacheNode = {
        lastAccessed: new Date(),
        path: idbNode.path,
        name: idbNode.name,
        type: idbNode.type,
        parentPath: idbNode.parentPath,
        content: idbNode.content,
        created: new Date(idbNode.created),
        modified: new Date(idbNode.modified),
        permissions: idbNode.permissions,
        size: idbNode.size,
        dirty: false
      };

      this.cache.set(idbNode.path, cacheNode);
    }
  }

  async forcSync(): Promise<void> {
    await this.syncToStorage();
  }
}
