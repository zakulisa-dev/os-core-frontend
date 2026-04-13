import {
  createWindowId,
  OpenWindowProps,
  WindowId,
  WindowManagerAPI,
  WindowPosition,
  WindowProps,
  WindowSize,
} from '@nameless-os/sdk';
import { v4 as uuidv4 } from 'uuid';
import { useWindowManagerStore } from './windowManager.store';
import { useAppsInstancesStore } from '../app/appsInstances.store';
import { EventBusApiImpl } from '../eventBus/eventBus.api-impl';

export class WindowManager implements WindowManagerAPI {
  private listeners = new Set<(windows: WindowProps[]) => void>();

  constructor(eventBus: EventBusApiImpl) {
    eventBus.sub('app:closed', this.handleAppClosed.bind(this));
  }

  private handleAppClosed(data: { instanceId: string }) {
    this.closeWindowsByInstance(data.instanceId);
  }

  private notify() {
    const windows = useWindowManagerStore.getState().windows;
    this.listeners.forEach((cb) => cb(windows));
  }

  openWindow(props: OpenWindowProps): WindowId {
    const id = createWindowId(uuidv4());
    const appInstance = useAppsInstancesStore.getState().getInstance(props.appInstanceId);
    const zIndex =  (useWindowManagerStore.getState().windows.find((el) => el.focused)?.zIndex || 100) + 1;

    const newWindow: WindowProps = {
      id,
      title: props.title,
      appInstanceId: props.appInstanceId,
      persistentAppTypeId: appInstance.persistentAppTypeId,
      position: { left: 300, top: 250 },
      size: props.size,
      resizable: props.resizable ?? true,
      zIndex,
      focused: true,
      minimized: false,
      maximized: false,
      fullscreen: false,
      component: props.component,
      createdAt: Date.now(),
    };

    const current = useWindowManagerStore.getState().windows;
    const updated = current.map(w => ({ ...w, focused: false })).concat(newWindow);
    useWindowManagerStore.getState().setWindows(updated);
    this.notify();

    return id;
  }

  closeWindow(id: WindowId): void {
    const updated = useWindowManagerStore.getState().windows.filter(w => w.id !== id);
    useWindowManagerStore.getState().setWindows(updated);
    this.notify();
  }

  closeWindowsByInstance(appInstanceId: string): void {
    const windows = useWindowManagerStore.getState().windows;
    const windowsToClose = windows.filter(w => w.appInstanceId === appInstanceId);

    if (windowsToClose.length === 0) return;

    const remainingWindows = windows.filter(w => w.appInstanceId !== appInstanceId);
    useWindowManagerStore.getState().setWindows(remainingWindows);
    this.notify();
  }

  moveWindow(id: WindowId, position: WindowPosition): void {
    this.updateWindow(id, { position });
  }

  resizeWindow(id: WindowId, size: WindowSize): void {
    this.updateWindow(id, { size });
  }

  focusWindow(id: WindowId): void {
    if (useWindowManagerStore.getState().windows.find((el) => el.id === id)?.focused) {
      return;
    }
    useWindowManagerStore.setState(state => {
      const initZIndex = state.windows.find((el) => el.id === id)!.zIndex;
      const maxZ = Math.max(...state.windows.map(w => w.zIndex));

      const windows = state.windows.map(w => {
        if (w.id === id) {
          return { ...w, focused: true, zIndex: maxZ };
        }
        return { ...w, focused: false, zIndex: w.zIndex > initZIndex ? w.zIndex - 1 : w.zIndex };
      });

      return { windows };
    });

    this.notify();
  }

  minimizeWindow(id: WindowId): void {
    const windows = useWindowManagerStore.getState().windows;
    const target = windows.find(w => w.id === id);
    if (!target) return;
    this.updateWindow(id, { minimized: true });
    if (target.focused && windows.length > 1) {
      this.focusWindow(windows[windows.length - 2].id);
    }
  }

  maximizeWindow(id: WindowId): void {
    this.updateWindow(id, { maximized: true });
  }

  restoreWindow(id: WindowId): void {
    this.updateWindow(id, { minimized: false, maximized: false });
    this.focusWindow(id);
  }

  getWindows(): WindowProps[] {
    return useWindowManagerStore.getState().windows;
  }

  getWindow(id: WindowId): WindowProps | undefined {
    return useWindowManagerStore.getState().windows.find(w => w.id === id);
  }

  getFocusedWindow(): WindowProps | undefined {
    return useWindowManagerStore.getState().windows.find(w => w.focused);
  }

  onChange(callback: (windows: WindowProps[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private updateWindow(id: WindowId, updates: Partial<WindowProps>) {
    const updated = useWindowManagerStore.getState().windows.map(w =>
      w.id === id ? { ...w, ...updates } : w
    );
    useWindowManagerStore.getState().setWindows(updated);
    this.notify();
  }

  toggleFullscreen(id: WindowId) {
    this.updateWindow(id, { fullscreen: true });
  }
}