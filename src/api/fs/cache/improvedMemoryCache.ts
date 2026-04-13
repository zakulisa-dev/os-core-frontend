import { LRUCache } from './lruCache';
import { FileType } from '@nameless-os/sdk';

export interface CacheNode {
  path: string;
  name: string;
  type: FileType;
  parentPath: string;
  content?: string;
  created: Date;
  modified: Date;
  permissions: string;
  size: number;
  dirty: boolean;
  lastAccessed: Date;
}

export class ImprovedMemoryCache {
  cache: LRUCache<string, CacheNode>;
  private dirtyNodes = new Set<string>();
  private childrenIndex = new Map<string, Set<string>>();

  constructor(maxSize = 1000) {
    this.cache = new LRUCache(maxSize);
  }

  set(path: string, node: CacheNode): void {
    const existing = this.cache.get(path);

    if (existing && existing.parentPath !== node.parentPath) {
      this.removeFromChildrenIndex(existing.parentPath, path);
      this.addToChildrenIndex(node.parentPath, path);
    } else if (!existing) {
      this.addToChildrenIndex(node.parentPath, path);
    }

    this.cache.set(path, { ...node, lastAccessed: new Date() });

    if (node.dirty) {
      this.dirtyNodes.add(path);
    }
  }

  get(path: string): CacheNode | undefined {
    const node = this.cache.get(path);
    if (node) {
      node.lastAccessed = new Date();
    }
    return node;
  }

  has(path: string): boolean {
    return this.cache.has(path);
  }

  delete(path: string): void {
    const node = this.cache.get(path);
    if (node) {
      this.removeFromChildrenIndex(node.parentPath, path);

      if (node.type === 'directory') {
        const children = this.childrenIndex.get(path);
        if (children) {
          for (const childPath of children) {
            this.delete(childPath);
          }
        }
        this.childrenIndex.delete(path);
      }
    }

    this.cache.delete(path);
    this.dirtyNodes.delete(path);
  }

  getChildren(parentPath: string): CacheNode[] {
    const childPaths = this.childrenIndex.get(parentPath);
    if (!childPaths) return [];

    const children: CacheNode[] = [];
    for (const childPath of childPaths) {
      const node = this.cache.get(childPath);
      if (node) {
        children.push(node);
      } else {
        childPaths.delete(childPath);
      }
    }

    return children;
  }

  private addToChildrenIndex(parentPath: string, childPath: string): void {
    if (!this.childrenIndex.has(parentPath)) {
      this.childrenIndex.set(parentPath, new Set());
    }
    this.childrenIndex.get(parentPath)!.add(childPath);
  }

  private removeFromChildrenIndex(parentPath: string, childPath: string): void {
    const children = this.childrenIndex.get(parentPath);
    if (children) {
      children.delete(childPath);
      if (children.size === 0) {
        this.childrenIndex.delete(parentPath);
      }
    }
  }

  markDirty(path: string): void {
    const node = this.cache.get(path);
    if (node) {
      node.dirty = true;
      node.modified = new Date();
      this.dirtyNodes.add(path);
    }
  }

  getDirtyNodes(): string[] {
    return Array.from(this.dirtyNodes);
  }

  clearDirty(path: string): void {
    const node = this.cache.get(path);
    if (node) {
      node.dirty = false;
      this.dirtyNodes.delete(path);
    }
  }

  clear(): void {
    this.cache.clear();
    this.dirtyNodes.clear();
    this.childrenIndex.clear();
  }

  size(): number {
    return this.cache.size();
  }

  getStats() {
    return {
      ...this.cache.getStats(),
      dirtyNodes: this.dirtyNodes.size,
      childrenIndexSize: this.childrenIndex.size
    };
  }
}