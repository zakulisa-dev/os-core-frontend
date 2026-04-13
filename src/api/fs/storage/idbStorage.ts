import { FileType, Nullable } from '@nameless-os/sdk';

export interface IDBFileNode {
  id: string;
  name: string;
  path: string;
  type: FileType;
  parentPath: string;
  content?: string;
  created: number;
  modified: number;
  permissions: string;
  size: number;
}

export class IndexedDBStorage {
  private db: Nullable<IDBDatabase> = null;
  private readonly dbName = 'NamelessOSFileSystem';
  private readonly version = 1;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('nodes')) {
          const nodeStore = db.createObjectStore('nodes', { keyPath: 'path' });
          nodeStore.createIndex('parentPath', 'parentPath', { unique: false });
          nodeStore.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
    });
  }

  async getNode(path: string): Promise<Nullable<IDBFileNode>> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['nodes'], 'readonly');
      const store = transaction.objectStore('nodes');
      const request = store.get(path);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async setNode(node: IDBFileNode): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['nodes'], 'readwrite');
      const store = transaction.objectStore('nodes');
      const request = store.put(node);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteNode(path: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['nodes'], 'readwrite');
      const store = transaction.objectStore('nodes');
      const request = store.delete(path);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getChildren(parentPath: string): Promise<IDBFileNode[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['nodes'], 'readonly');
      const store = transaction.objectStore('nodes');
      const index = store.index('parentPath');
      const request = index.getAll(parentPath);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllNodes(): Promise<IDBFileNode[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['nodes'], 'readonly');
      const store = transaction.objectStore('nodes');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }
}