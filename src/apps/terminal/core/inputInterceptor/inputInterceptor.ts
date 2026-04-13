import { useTerminalStore } from '@Apps/terminal/stores/useTerminal.store';
import { CommandContext } from '@nameless-os/sdk';
import { OutputRenderer } from '@Apps/terminal/core/outputRenderer';

export class InputInterceptor {
  private interceptors: Record<string, (input: string) => void> = {};
  private outputRenderer: OutputRenderer;

  constructor(newOutputRenderer: OutputRenderer) {
    this.outputRenderer = newOutputRenderer;
  }

  setInterceptor(appId: string, interceptor: (input: string) => void): void {
    useTerminalStore.getState().setInputInterceptor(appId, true);
    this.interceptors[appId] = interceptor;
  }

  clearInterceptor(appId: string): void {
    useTerminalStore.getState().setInputInterceptor(appId, false);
    delete this.interceptors[appId];
  }

  hasInterceptor(appId: string): boolean {
    return this.interceptors[appId] !== undefined;
  }

  handleInput(appId: string, input: string): void {
    const interceptor = this.interceptors[appId];
    if (interceptor) {
      this.clearInterceptor(appId);
      interceptor(input);
    }
  }

  awaitInput(appId: string): Promise<string> {
    return new Promise<string>((resolve) => {
      this.setInterceptor(appId, (input: string) => {
        resolve(input);
      });
    });
  }

  awaitConfirm(message: string, appId: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.outputRenderer.print(`${message} (y/n): `, appId);

      const handleConfirmInput = (input: string) => {
        const normalized = input.trim().toLowerCase();

        if (['y', 'yes', '1', 'true'].includes(normalized)) {
          resolve(true);
        } else if (['n', 'no', '0', 'false'].includes(normalized)) {
          resolve(false);
        } else {
          this.outputRenderer.print("Please enter 'y' or 'n': ", appId);
          this.setInterceptor(appId, handleConfirmInput);
        }
      };

      this.setInterceptor(appId, handleConfirmInput);
    });
  }
}
