export class FSMutex {
  private locks = new Map<string, Promise<void>>();

  async acquire(path: string): Promise<() => void> {
    const normalizedPath = this.normalizePath(path);

    const existingLock = this.locks.get(normalizedPath);
    if (existingLock) {
      await existingLock;
    }

    let releaseFn: () => void;
    const lockPromise = new Promise<void>(resolve => {
      releaseFn = resolve;
    });

    this.locks.set(normalizedPath, lockPromise);

    return () => {
      this.locks.delete(normalizedPath);
      releaseFn();
    };
  }

  private normalizePath(path: string): string {
    return path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  }

  isLocked(path: string): boolean {
    return this.locks.has(this.normalizePath(path));
  }
}