import { AppInstanceId } from '@nameless-os/sdk';

export class ExecutionManager {
  private abortControllers: Record<AppInstanceId, AbortController> = {};
  private cancelCallbacks: Record<AppInstanceId, (() => void)[]> = {};

  createExecution(instanceId: AppInstanceId): {
    signal: AbortSignal;
    isCancelled: () => boolean;
    onCancel: (callback: () => void) => void;
  } {
    this.cleanup(instanceId);

    const abortController = new AbortController();
    this.abortControllers[instanceId] = abortController;
    this.cancelCallbacks[instanceId] = [];

    return {
      signal: abortController.signal,
      isCancelled: () => abortController.signal.aborted,
      onCancel: (callback: () => void) => {
        if (abortController.signal.aborted) {
          callback();
          return;
        }

        const callbacks = this.cancelCallbacks[instanceId];
        if (callbacks) {
          callbacks.push(callback);
        }

        abortController.signal.addEventListener('abort', callback, { once: true });
      },
    };
  }

  cancelExecution(instanceId: AppInstanceId): boolean {
    const controller = this.abortControllers[instanceId];
    if (!controller) {
      return false;
    }

    if (controller.signal.aborted) {
      return false;
    }

    controller.abort();
    return true;
  }

  isExecuting(instanceId: AppInstanceId): boolean {
    const controller = this.abortControllers[instanceId];
    return controller !== undefined && !controller.signal.aborted;
  }

  getSignal(instanceId: AppInstanceId): AbortSignal | undefined {
    return this.abortControllers[instanceId]?.signal;
  }

  finishExecution(instanceId: AppInstanceId): void {
    this.cleanup(instanceId);
  }

  cancelAll(): void {
    Object.keys(this.abortControllers).forEach(instanceId => {
      this.cancelExecution(instanceId);
    });
    this.cleanupAll();
  }

  getActiveExecutions(): AppInstanceId[] {
    return Object.keys(this.abortControllers).filter(instanceId =>
      this.isExecuting(instanceId)
    );
  }

  private cleanup(instanceId: AppInstanceId): void {
    delete this.abortControllers[instanceId];
    delete this.cancelCallbacks[instanceId];
  }

  private cleanupAll(): void {
    this.abortControllers = {};
    this.cancelCallbacks = {};
  }

  destroy(): void {
    this.cancelAll();
  }
}
