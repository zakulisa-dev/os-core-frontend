import { FSMutex } from './utils/fsMutex';
import { PathValidator } from './utils/pathValidator';
import { ImprovedMemoryCache, CacheNode } from './cache/improvedMemoryCache';
import { FSTransaction } from './transaction/fsTransaction';
import {
  FSError, FSPathError, FSNotFoundError, FSExistsError, FSQuotaError
} from './errors/fsErrors';
import { IndexedDBStorage } from './storage/idbStorage';
import { SyncManager } from './sync/syncManager';
import { dirname, normalize, PathUtils, resolvePath } from './utils/pathUtils';
import { defaultFSConfig, FSConfig } from './config/fsConfig';
import { FileEntry, FileStats, FileSystemAPI, Nullable } from '@nameless-os/sdk';
import { FSEventMap } from '@nameless-os/sdk/dist/api/fileSystem/fileSystem.events';
import { systemApi } from '../../index';

export class ImprovedWebOSFileSystem implements FileSystemAPI {
  private cache: ImprovedMemoryCache;
  private storage: IndexedDBStorage;
  private syncManager: SyncManager;
  private mutex: FSMutex;
  private initialized = false;
  private readonly maxFileSize: number;
  private readonly maxTotalSize: number;
  private currentSize = 0;

  constructor(config: Partial<FSConfig> = {}) {
    const finalConfig = { ...defaultFSConfig, ...config };

    this.cache = new ImprovedMemoryCache(finalConfig.maxCacheSize);
    this.storage = new IndexedDBStorage();
    this.syncManager = new SyncManager(this.cache, this.storage, finalConfig.syncIntervalMs);
    this.mutex = new FSMutex();
    this.maxFileSize = finalConfig.maxFileSize || 100 * 1024 * 1024;
    this.maxTotalSize = finalConfig.maxTotalSize || 10000 * 1024 * 1024;
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.storage.init();
      await this.syncManager.loadFromStorage();

      await this.calculateCurrentSize();

      if (this.cache.size() === 0) {
        await this.initializeBasicStructure();
      }

      this.syncManager.startAutoSync();
      this.initialized = true;
    } catch (error) {
      throw new FSError(
        'Failed to initialize filesystem',
        'INIT_ERROR',
        undefined,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async isDirectory(path: string): Promise<boolean> {
    try {
      const stats = await this.stat(path);
      return stats.isDirectory;
    } catch {
      return false;
    }
  }

  async resolveAndValidatePath(currentDir: string, targetPath: string): Promise<string> {
    this.ensureInitialized();

    const resolvedPath = resolvePath(currentDir, targetPath);

    const exists = await this.exists(resolvedPath);
    if (!exists) {
      throw new FSNotFoundError(resolvedPath);
    }

    const isDir = await this.isDirectory(resolvedPath);
    if (!isDir) {
      throw new FSError(`Not a directory: ${resolvedPath}`, 'NOT_DIRECTORY', resolvedPath);
    }

    return resolvedPath;
  }

  async getPathCompletions(currentDir: string, partialPath: string): Promise<string[]> {
    this.ensureInitialized();

    try {
      let searchDir: string;
      let prefix: string;

      if (partialPath.includes('/')) {
        const lastSlash = partialPath.lastIndexOf('/');
        const dirPart = partialPath.substring(0, lastSlash + 1);
        prefix = partialPath.substring(lastSlash + 1);

        if (partialPath.startsWith('/')) {
          searchDir = normalize(dirPart);
        } else if (partialPath.startsWith('~/')) {
          searchDir = resolvePath('/home', dirPart);
        } else {
          searchDir = resolvePath(currentDir, dirPart);
        }
      } else {
        searchDir = currentDir;
        prefix = partialPath;
      }

      if (!await this.exists(searchDir) || !await this.isDirectory(searchDir)) {
        return [];
      }

      const entries = await this.readDir(searchDir);

      return entries
        .filter(entry =>
          entry.type === 'directory' &&
          entry.name.toLowerCase().startsWith(prefix.toLowerCase())
        )
        .map(entry => entry.name)
        .sort();

    } catch {
      return [];
    }
  }

  async canReadDirectory(path: string): Promise<boolean> {
    try {
      await this.readDir(path);
      return true;
    } catch {
      return false;
    }
  }

  async getDirectoryInfo(path: string): Promise<{
    path: string;
    exists: boolean;
    isDirectory: boolean;
    canRead: boolean;
    childCount: number;
    stats?: FileStats;
  }> {
    const normalizedPath = normalize(path);

    const exists = await this.exists(normalizedPath);
    if (!exists) {
      return {
        path: normalizedPath,
        exists: false,
        isDirectory: false,
        canRead: false,
        childCount: 0
      };
    }

    const stats = await this.stat(normalizedPath);
    const isDirectory = stats.isDirectory;
    const canRead = isDirectory ? await this.canReadDirectory(normalizedPath) : false;

    let childCount = 0;
    if (isDirectory && canRead) {
      try {
        const children = await this.readDir(normalizedPath);
        childCount = children.length;
      } catch {
        childCount = 0;
      }
    }

    return {
      path: normalizedPath,
      exists,
      isDirectory,
      canRead,
      childCount,
      stats
    };
  }

  async touchFile(currentDir: string, targetPath: string): Promise<string> {
    const resolvedPath = resolvePath(currentDir, targetPath);
    const parentDir = dirname(resolvedPath);

    await this.resolveAndValidatePath('/', parentDir);

    const exists = await this.exists(resolvedPath);
    if (exists) {
      const stats = await this.stat(resolvedPath);
      if (stats.isDirectory) {
        throw new FSError(`Is a directory: ${resolvedPath}`, 'IS_DIRECTORY', resolvedPath);
      }

      const content = await this.readFile(resolvedPath);
      await this.writeFile(resolvedPath, content);
    } else {
      await this.writeFile(resolvedPath, '');
    }

    return resolvedPath;
  }

  private async calculateCurrentSize(): Promise<void> {
    this.currentSize = 0;
    const allPaths = Array.from(this.cache.cache.keys());

    for (const path of allPaths) {
      const node = this.cache.get(path);
      if (node && node.type === 'file') {
        this.currentSize += node.size;
      }
    }
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new FSError('FileSystem not initialized. Call init() first.', 'NOT_INITIALIZED');
    }
  }

  private checkQuota(additionalSize: number): void {
    if (this.currentSize + additionalSize > this.maxTotalSize) {
      throw new FSQuotaError(
        `Quota exceeded: ${this.currentSize + additionalSize} bytes > ${this.maxTotalSize} bytes`
      );
    }
  }

  async readFile(path: string): Promise<string> {
    this.ensureInitialized();

    try {
      PathValidator.validatePath(path);
    } catch (error) {
      throw new FSPathError(
        error instanceof Error ? error.message : 'Invalid path',
        path,
        error instanceof Error ? error : undefined
      );
    }

    const normalizedPath = PathValidator.sanitizePath(path);
    const release = await this.mutex.acquire(normalizedPath);

    try {
      const node = this.cache.get(normalizedPath);
      if (!node) {
        throw new FSNotFoundError(path);
      }

      if (node.type !== 'file') {
        throw new FSError(`Is a directory: ${path}`, 'IS_DIRECTORY', path);
      }

      node.lastAccessed = new Date();

      return node.content || '';
    } finally {
      release();
    }
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.ensureInitialized();

    try {
      PathValidator.validatePath(path);
    } catch (error) {
      throw new FSPathError(
        error instanceof Error ? error.message : 'Invalid path',
        path,
        error instanceof Error ? error : undefined
      );
    }

    if (content.length > this.maxFileSize) {
      throw new FSError(
        `File too large: ${content.length} bytes > ${this.maxFileSize} bytes`,
        'FILE_TOO_LARGE',
        path
      );
    }

    const normalizedPath = PathValidator.sanitizePath(path);
    const parentPath = PathUtils.dirname(normalizedPath);
    const name = PathUtils.basename(normalizedPath);

    try {
      PathValidator.validateFilename(name);
    } catch (error) {
      throw new FSPathError(
        error instanceof Error ? error.message : 'Invalid filename',
        path,
        error instanceof Error ? error : undefined
      );
    }

    const release = await this.mutex.acquire(normalizedPath);

    try {
      const parent = this.cache.get(parentPath);
      if (!parent) {
        throw new FSNotFoundError(parentPath);
      }

      if (parent.type !== 'directory') {
        throw new FSError(`Not a directory: ${parentPath}`, 'NOT_DIRECTORY', parentPath);
      }

      const existing = this.cache.get(normalizedPath);
      const now = new Date();

      const oldSize = existing?.size || 0;
      const sizeDelta = content.length - oldSize;
      this.checkQuota(sizeDelta);

      const transaction = new FSTransaction();

      if (existing) {
        if (existing.type !== 'file') {
          throw new FSError(`Is a directory: ${path}`, 'IS_DIRECTORY', path);
        }

        const oldContent = existing.content;
        const oldModified = existing.modified;

        transaction.add({
          type: 'modify',
          path: normalizedPath,
          execute: async () => {
            existing.content = content;
            existing.size = content.length;
            existing.modified = now;
            existing.lastAccessed = now;
            this.cache.markDirty(normalizedPath);
            this.currentSize += sizeDelta;
          },
          rollback: async () => {
            existing.content = oldContent;
            existing.size = oldSize;
            existing.modified = oldModified;
            this.cache.markDirty(normalizedPath);
            this.currentSize -= sizeDelta;
          }
        });

        await transaction.execute();
        this.emitEvent('fs:changed', {
          path: normalizedPath,
          oldSize: oldSize,
          newSize: content.length,
          type: 'file',
        });

      } else {
        let createdNode: Nullable<CacheNode> = null;

        transaction.add({
          type: 'create',
          path: normalizedPath,
          execute: async () => {
            createdNode = {
              path: normalizedPath,
              name,
              type: 'file',
              parentPath,
              content,
              created: now,
              modified: now,
              lastAccessed: now,
              permissions: defaultFSConfig.defaultPermissions.file,
              size: content.length,
              dirty: true
            };

            this.cache.set(normalizedPath, createdNode);
            this.currentSize += content.length;
          },
          rollback: async () => {
            if (createdNode) {
              this.cache.delete(normalizedPath);
              this.currentSize -= content.length;
            }
          }
        });

        await transaction.execute();
        this.emitEvent('fs:created', {
          path: normalizedPath,
          type: 'file',
          size: content.length
        });
      }

      parent.modified = now;
      this.cache.markDirty(parentPath);
    } finally {
      release();
    }
  }

  private async initializeBasicStructure(): Promise<void> {
    const now = new Date();

    const rootNode: CacheNode = {
      path: '/',
      name: '',
      type: 'directory',
      parentPath: '',
      created: now,
      modified: now,
      lastAccessed: now,
      permissions: 'rwxr-xr-x',
      size: 0,
      dirty: true
    };
    this.cache.set('/', rootNode);

    const basicDirs = [
      { path: '/home', name: 'home' },
      { path: '/tmp', name: 'tmp' },
      { path: '/usr', name: 'usr' },
      { path: '/var', name: 'var' },
      { path: '/bin', name: 'bin' }
    ];

    for (const { path, name } of basicDirs) {
      const dirNode: CacheNode = {
        path,
        name,
        type: 'directory',
        parentPath: '/',
        created: now,
        modified: now,
        lastAccessed: now,
        permissions: defaultFSConfig.defaultPermissions.directory,
        size: 0,
        dirty: true
      };
      this.cache.set(path, dirNode);
    }
  }

  async delete(path: string, options: { recursive?: boolean } = {}): Promise<void> {
    console.log('hhhhhhhhhhhhhhhhhhhhhhh');
    this.ensureInitialized();
    console.log(options, 'opt');

    try {
      PathValidator.validatePath(path);
    } catch (error) {
      throw new FSPathError(
        error instanceof Error ? error.message : 'Invalid path',
        path,
        error instanceof Error ? error : undefined
      );
    }

    const normalizedPath = PathValidator.sanitizePath(path);

    if (normalizedPath === '/') {
      throw new FSError('Cannot delete root directory', 'CANNOT_DELETE_ROOT', path);
    }

    const release = await this.mutex.acquire(normalizedPath);

    try {
      const node = this.cache.get(normalizedPath);
      if (!node) {
        throw new FSNotFoundError(path);
      }

      if (node.type === 'directory') {
        const children = this.cache.getChildren(normalizedPath);
        if (children.length > 0 && !options.recursive) {
          console.log('yyyyyyyy');
          throw new FSError(`Directory not empty: ${path}`, 'DIRECTORY_NOT_EMPTY', path);
        }
      }

      const transaction = new FSTransaction();
      const deletedNodes = new Map<string, CacheNode>();

      const nodesToDelete: string[] = [];

      if (node.type === 'directory' && options.recursive) {
        const collectChildren = (dirPath: string) => {
          const children = this.cache.getChildren(dirPath);
          for (const child of children) {
            nodesToDelete.push(child.path);
            if (child.type === 'directory') {
              collectChildren(child.path);
            }
          }
        };
        collectChildren(normalizedPath);
      }

      nodesToDelete.push(normalizedPath);

      for (const nodePath of nodesToDelete) {
        const nodeToDelete = this.cache.get(nodePath);
        if (nodeToDelete) {
          deletedNodes.set(nodePath, { ...nodeToDelete });

          transaction.add({
            type: 'delete',
            path: nodePath,
            execute: async () => {
              this.cache.delete(nodePath);
              if (nodeToDelete.type === 'file') {
                this.currentSize -= nodeToDelete.size;
              }
            },
            rollback: async () => {
              const restoredNode = deletedNodes.get(nodePath);
              if (restoredNode) {
                this.cache.set(nodePath, restoredNode);
                if (restoredNode.type === 'file') {
                  this.currentSize += restoredNode.size;
                }
              }
            }
          });
        }
      }

      await transaction.execute();

      for (const nodePath of nodesToDelete) {
        try {
          await this.storage.deleteNode(nodePath);
        } catch (error) {
          console.warn(`Failed to delete from storage: ${nodePath}`, error);
        }
      }

      const parentPath = PathUtils.dirname(normalizedPath);
      const parent = this.cache.get(parentPath);
      if (parent) {
        parent.modified = new Date();
        this.cache.markDirty(parentPath);
      }

      this.emitEvent(
        'fs:deleted',
        {
          path: normalizedPath,
          type: node.type
        }
      );

    } finally {
      release();
    }
  }

  async mkdir(path: string, options: { recursive?: boolean } = {}): Promise<void> {
    this.ensureInitialized();

    try {
      PathValidator.validatePath(path);
    } catch (error) {
      throw new FSPathError(
        error instanceof Error ? error.message : 'Invalid path',
        path,
        error instanceof Error ? error : undefined
      );
    }

    const normalizedPath = PathValidator.sanitizePath(path);
    const name = PathUtils.basename(normalizedPath);

    try {
      PathValidator.validateFilename(name);
    } catch (error) {
      throw new FSPathError(
        error instanceof Error ? error.message : 'Invalid directory name',
        path,
        error instanceof Error ? error : undefined
      );
    }

    const release = await this.mutex.acquire(normalizedPath);

    try {
      if (this.cache.has(normalizedPath)) {
        const existing = this.cache.get(normalizedPath);
        if (existing?.type === 'directory') {
          return;
        } else {
          throw new FSExistsError(path);
        }
      }

      if (options.recursive) {
        const parts = PathUtils.getPathParts(normalizedPath);
        let currentPath = '/';

        for (const part of parts) {
          currentPath = PathUtils.join(currentPath, part);

          if (!this.cache.has(currentPath)) {
            await this.mkdirSingle(currentPath);
          }
        }
      } else {
        await this.mkdirSingle(normalizedPath);
      }

    } finally {
      release();
    }
  }

  private async mkdirSingle(path: string): Promise<void> {
    const parentPath = PathUtils.dirname(path);
    const name = PathUtils.basename(path);

    const parent = this.cache.get(parentPath);
    if (!parent) {
      throw new FSNotFoundError(parentPath);
    }

    if (parent.type !== 'directory') {
      throw new FSError(`Not a directory: ${parentPath}`, 'NOT_DIRECTORY', parentPath);
    }

    const now = new Date();
    const newDir: CacheNode = {
      path,
      name,
      type: 'directory',
      parentPath,
      created: now,
      modified: now,
      lastAccessed: now,
      permissions: defaultFSConfig.defaultPermissions.directory,
      size: 0,
      dirty: true
    };

    this.cache.set(path, newDir);

    parent.modified = now;
    this.cache.markDirty(parentPath);

    this.emitEvent('fs:created', {
      path,
      type: 'directory'
    });
  }

  async move(from: string, to: string): Promise<void> {
    this.ensureInitialized();

    try {
      PathValidator.validatePath(from);
      PathValidator.validatePath(to);
    } catch (error) {
      throw new FSPathError(
        error instanceof Error ? error.message : 'Invalid path',
        from,
        error instanceof Error ? error : undefined
      );
    }

    const normalizedFrom = PathValidator.sanitizePath(from);
    const normalizedTo = PathValidator.sanitizePath(to);

    if (normalizedFrom === '/') {
      throw new FSError('Cannot move root directory', 'CANNOT_MOVE_ROOT', from);
    }

    if (normalizedFrom === normalizedTo) {
      return;
    }

    if (PathUtils.isSubPath(normalizedTo, normalizedFrom)) {
      throw new FSError(
        'Cannot move directory into itself',
        'INVALID_MOVE',
        from
      );
    }

    const releaseFrom = await this.mutex.acquire(normalizedFrom);
    const releaseTo = await this.mutex.acquire(normalizedTo);

    try {
      const sourceNode = this.cache.get(normalizedFrom);
      if (!sourceNode) {
        throw new FSNotFoundError(from);
      }

      if (this.cache.has(normalizedTo)) {
        throw new FSExistsError(to);
      }

      const targetParent = PathUtils.dirname(normalizedTo);
      const parent = this.cache.get(targetParent);
      if (!parent) {
        throw new FSNotFoundError(targetParent);
      }

      if (parent.type !== 'directory') {
        throw new FSError(`Not a directory: ${targetParent}`, 'NOT_DIRECTORY', targetParent);
      }

      const transaction = new FSTransaction();
      const movedNodes = new Map<string, { oldPath: string; newPath: string; node: CacheNode }>();

      const nodesToMove: Array<{ oldPath: string; newPath: string }> = [];

      if (sourceNode.type === 'directory') {
        const collectChildren = (dirPath: string, newDirPath: string) => {
          const children = this.cache.getChildren(dirPath);
          for (const child of children) {
            const newChildPath = PathUtils.join(newDirPath, child.name);
            nodesToMove.push({ oldPath: child.path, newPath: newChildPath });

            if (child.type === 'directory') {
              collectChildren(child.path, newChildPath);
            }
          }
        };
        collectChildren(normalizedFrom, normalizedTo);
      }

      nodesToMove.push({ oldPath: normalizedFrom, newPath: normalizedTo });

      for (const { oldPath, newPath } of nodesToMove) {
        const nodeToMove = this.cache.get(oldPath);
        if (nodeToMove) {
          const oldParentPath = nodeToMove.parentPath;
          const newParentPath = PathUtils.dirname(newPath);
          const newName = PathUtils.basename(newPath);

          movedNodes.set(oldPath, {
            oldPath,
            newPath,
            node: { ...nodeToMove }
          });

          transaction.add({
            type: 'move',
            path: oldPath,
            execute: async () => {
              this.cache.delete(oldPath);

              const movedNode: CacheNode = {
                ...nodeToMove,
                path: newPath,
                name: newName,
                parentPath: newParentPath,
                modified: new Date(),
                dirty: true
              };

              this.cache.set(newPath, movedNode);
            },
            rollback: async () => {
              const original = movedNodes.get(oldPath);
              if (original) {
                this.cache.delete(newPath);
                this.cache.set(oldPath, original.node);
              }
            }
          });
        }
      }

      await transaction.execute();

      const oldParent = this.cache.get(PathUtils.dirname(normalizedFrom));
      if (oldParent) {
        oldParent.modified = new Date();
        this.cache.markDirty(oldParent.path);
      }

      parent.modified = new Date();
      this.cache.markDirty(parent.path);

      this.emitEvent(
        'fs:moved',
        {
          from: normalizedFrom,
          to: normalizedTo,
          type: 'file', // TODO: fix
        }
      );

    } finally {
      releaseTo();
      releaseFrom();
    }
  }

  async readDir(path: string): Promise<FileEntry[]> {
    this.ensureInitialized();

    try {
      PathValidator.validatePath(path);
    } catch (error) {
      throw new FSPathError(
        error instanceof Error ? error.message : 'Invalid path',
        path,
        error instanceof Error ? error : undefined
      );
    }

    const normalizedPath = PathValidator.sanitizePath(path);
    const release = await this.mutex.acquire(normalizedPath);

    try {
      const node = this.cache.get(normalizedPath);
      if (!node) {
        throw new FSNotFoundError(path);
      }

      if (node.type !== 'directory') {
        throw new FSError(`Not a directory: ${path}`, 'NOT_DIRECTORY', path);
      }

      node.lastAccessed = new Date();

      const children = this.cache.getChildren(normalizedPath);

      return children
        .map(child => this.nodeToFileEntry(child))
        .sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });
    } finally {
      release();
    }
  }

  async exists(path: string): Promise<boolean> {
    this.ensureInitialized();

    try {
      PathValidator.validatePath(path);
      const normalizedPath = PathValidator.sanitizePath(path);
      return this.cache.has(normalizedPath);
    } catch {
      return false;
    }
  }

  async stat(path: string): Promise<FileStats> {
    this.ensureInitialized();

    try {
      PathValidator.validatePath(path);
    } catch (error) {
      throw new FSPathError(
        error instanceof Error ? error.message : 'Invalid path',
        path,
        error instanceof Error ? error : undefined
      );
    }

    const normalizedPath = PathValidator.sanitizePath(path);
    const node = this.cache.get(normalizedPath);

    if (!node) {
      throw new FSNotFoundError(path);
    }

    node.lastAccessed = new Date();

    return this.nodeToStats(node);
  }

  async copy(from: string, to: string): Promise<void> {
    this.ensureInitialized();

    const sourceContent = await this.readFile(from);
    await this.writeFile(to, sourceContent);
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    return this.move(oldPath, newPath);
  }

  private nodeToStats(node: CacheNode): FileStats {
    return {
      size: node.size,
      created: node.created,
      modified: node.modified,
      isDirectory: node.type === 'directory',
      isFile: node.type === 'file',
      permissions: node.permissions
    };
  }

  private nodeToFileEntry(node: CacheNode): FileEntry {
    return {
      name: node.name,
      path: node.path,
      type: node.type,
      stats: this.nodeToStats(node)
    };
  }

  private emitEvent<K extends keyof FSEventMap>(
    event: K,
    payload: FSEventMap[K]
  ): void {
    systemApi.eventBus.emit(event, payload);
  }

  on<K extends keyof FSEventMap>(
    event: K,
    callback: (payload: FSEventMap[K]) => void
  ): () => void {
    systemApi.eventBus.sub(event, callback);
    return () => systemApi.eventBus.unsub(event, callback);
  }

  async flush(): Promise<void> {
    await this.syncManager.forcSync();
  }

  async shutdown(): Promise<void> {
    this.syncManager.stopAutoSync();
    await this.syncManager.forcSync();
    this.initialized = false;
  }

  getStats() {
    return {
      ...this.cache.getStats(),
      currentSize: this.currentSize,
      maxTotalSize: this.maxTotalSize,
      storageUtilization: (this.currentSize / this.maxTotalSize) * 100,
      initialized: this.initialized,
      lockedPaths: []
    };
  }
}