import { v4 as uuidv4 } from 'uuid';
import { DesktopIcon, useIconStore } from './stores/icon.store';
import { AppAPI, AppDefinition, FileSystemAPI, PersistentAppTypeId, StorageAPI } from '@nameless-os/sdk';
import { useRegisteredAppsStore } from '../../api/app/appDefinitons.store';

export class IconManager {
  private appAPI: AppAPI;
  private fileSystemAPI: FileSystemAPI;
  private storageAPI: StorageAPI;

  constructor(systemApi: any) {
    this.appAPI = systemApi.app;
    this.fileSystemAPI = systemApi.fileSystem;
    this.storageAPI = systemApi.storage;
  }

  createAppIcon(
    persistentAppTypeId: PersistentAppTypeId,
    appDefinition: AppDefinition,
    position?: { x: number; y: number },
  ): DesktopIcon {
    const { gridSettings } = useIconStore.getState();
    let localPosition: { x: number; y: number };
    let gridPosition: { row: number; col: number } | undefined;

    if (position) {
      localPosition = position;
      if (gridSettings.enabled) {
        gridPosition = this.pixelToGridPosition(position);
      }
    } else {
      const freeGridPos = this.getNextGridPosition();
      if (freeGridPos && gridSettings.enabled) {
        gridPosition = freeGridPos;
        localPosition = this.gridToPixelPosition(freeGridPos);
      } else {
        localPosition = this.findFreePositionFallback();
      }
    }

    const icon: DesktopIcon = {
      id: uuidv4(),
      type: 'app',
      persistentAppTypeId,
      position: localPosition,
      gridPosition,
      name: appDefinition.name,
      icon: appDefinition.icon,
      miniIcon: appDefinition.miniIcon,
    };

    useIconStore.getState().addIcon(icon);
    return icon;
  }

  async createFileIcon(
    filePath: string,
    position?: { x: number; y: number },
  ): Promise<DesktopIcon> {
    const stats = await this.fileSystemAPI.stat(filePath);
    const fileName = filePath.split('/').pop() || 'Unknown';
    const { gridSettings } = useIconStore.getState();

    let localPosition: { x: number; y: number };
    let gridPosition: { row: number; col: number } | undefined;

    if (position) {
      localPosition = position;
      if (gridSettings.enabled) {
        gridPosition = this.pixelToGridPosition(position);
      }
    } else {
      const freeGridPos = this.getNextGridPosition();
      if (freeGridPos && gridSettings.enabled) {
        gridPosition = freeGridPos;
        localPosition = this.gridToPixelPosition(freeGridPos);
      } else {
        localPosition = this.findFreePositionFallback();
      }
    }

    const icon: DesktopIcon = {
      id: uuidv4(),
      type: stats.isDirectory ? 'folder' : 'file',
      filePath,
      position: localPosition,
      gridPosition,
      name: fileName,
      icon: this.getFileIcon(filePath, stats.isDirectory),
    };

    useIconStore.getState().addIcon(icon);
    return icon;
  }

  async executeIcon(iconId: string): Promise<void> {
    const icon = useIconStore.getState().icons.find(i => i.id === iconId);
    if (!icon) return;

    if (icon.type === 'app' && icon.persistentAppTypeId) {
      const appId = this.findAppIdByPersistentId(icon.persistentAppTypeId);
      if (appId) {
        this.appAPI.startApp(appId);
      }
    } else if (icon.filePath) {
      await this.openFile(icon.filePath);
    }
  }

  async syncWithRegisteredApps(): Promise<void> {
  }

  async saveDesktopState(): Promise<void> {
    const { icons, gridSettings } = useIconStore.getState();
    await this.storageAPI.set('desktop-icons', icons);
    await this.storageAPI.set('desktop-grid-settings', gridSettings);
  }

  async loadDesktopState(): Promise<void> {
    try {
      const savedIcons = await this.storageAPI.get('desktop-icons');
      const savedGridSettings = await this.storageAPI.get('desktop-grid-settings');

      if (savedIcons) {
        useIconStore.setState({ icons: savedIcons });
      }

      if (savedGridSettings) {
        useIconStore.setState({ gridSettings: savedGridSettings });
      }
    } catch (error) {
      console.warn('Failed to load desktop state:', error);
    }
  }

  async createShortcutFromPath(
    filePath: string,
    desktopPosition: { x: number; y: number },
  ): Promise<DesktopIcon> {
    return this.createFileIcon(filePath, desktopPosition);
  }

  removeIcon(iconId: string): void {
    useIconStore.getState().removeIcon(iconId);
  }

  getAppIcons(): DesktopIcon[] {
    return useIconStore.getState().icons.filter(icon => icon.type === 'app');
  }

  getFileIcons(): DesktopIcon[] {
    return useIconStore.getState().icons.filter(icon => icon.type === 'file' || icon.type === 'folder');
  }

  hasAppIcon(persistentAppTypeId: PersistentAppTypeId): boolean {
    return useIconStore.getState().icons.some(
      icon => icon.persistentAppTypeId === persistentAppTypeId,
    );
  }

  createIconsForAllApps(apps: Array<{ persistentAppTypeId: PersistentAppTypeId; definition: AppDefinition }>): void {
    apps.forEach(({ persistentAppTypeId, definition }) => {
      if (!this.hasAppIcon(persistentAppTypeId)) {
        this.createAppIcon(persistentAppTypeId, definition);
      }
    });
  }

  getNextGridPosition(): { row: number; col: number } | null {
    const { icons, gridSettings } = useIconStore.getState();

    if (!gridSettings.enabled) return null;

    const occupiedPositions = new Set(
      icons
        .filter(icon => icon.gridPosition)
        .map(icon => `${icon.gridPosition!.row}-${icon.gridPosition!.col}`),
    );

    // Заполняем по столбцам (сверху вниз, затем следующий столбец)
    for (let col = 0; col < gridSettings.cols; col++) {
      for (let row = 0; row < gridSettings.rows; row++) {
        const key = `${row}-${col}`;
        if (!occupiedPositions.has(key)) {
          return { row, col };
        }
      }
    }

    return null;
  }

  gridToPixelPosition(gridPos: { row: number; col: number }): { x: number; y: number } {
    const { gridSettings } = useIconStore.getState();
    const taskbarHeight = 30; // Высота верхней панели
    const leftOffset = 10; // Отступ слева

    return {
      x: leftOffset + gridPos.col * (gridSettings.cellWidth + gridSettings.padding),
      y: taskbarHeight + gridPos.row * (gridSettings.cellHeight + gridSettings.padding),
    };
  }

  pixelToGridPosition(pixelPos: { x: number; y: number }): { row: number; col: number } {
    const { gridSettings } = useIconStore.getState();
    const taskbarHeight = 10; // Высота верхней панели
    const leftOffset = 10; // Отступ слева

    return {
      row: Math.floor((pixelPos.y - taskbarHeight) / (gridSettings.cellHeight + gridSettings.padding)),
      col: Math.floor((pixelPos.x - leftOffset) / (gridSettings.cellWidth + gridSettings.padding)),
    };
  }

  private getFileIcon(filePath: string, isDirectory: boolean): string {
    if (isDirectory) {
      return '📁';
    }

    const extension = filePath.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      'txt': '📄',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'png': '🖼️',
      'gif': '🖼️',
      'mp3': '🎵',
      'mp4': '🎬',
      'pdf': '📕',
      'zip': '📦',
      'js': '⚡',
      'ts': '⚡',
      'html': '🌐',
      'css': '🎨',
    };

    return iconMap[extension || ''] || '📄';
  }

  // Исправленный метод - теперь правильно находит свободную позицию в сетке
  private findFreePosition(): { x: number; y: number } {
    const { gridSettings } = useIconStore.getState();

    if (gridSettings.enabled) {
      const freeGridPos = this.getNextGridPosition();
      if (freeGridPos) {
        return this.gridToPixelPosition(freeGridPos);
      }
    }

    return this.findFreePositionFallback();
  }

  // Fallback метод для случаев когда сетка выключена или заполнена
  private findFreePositionFallback(): { x: number; y: number } {
    const { icons } = useIconStore.getState();

    const taskbarHeight = 20; // Высота верхней панели
    const baseX = 20;
    const baseY = taskbarHeight + 20; // Учитываем высоту панели
    const stepX = 70;
    const stepY = 70;

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const x = baseX + col * stepX;
        const y = baseY + row * stepY;

        // Проверяем, не занята ли эта позиция
        const isOccupied = icons.some(icon =>
          Math.abs(icon.position.x - x) < 50 && Math.abs(icon.position.y - y) < 50
        );

        if (!isOccupied) {
          return { x, y };
        }
      }
    }

    // Если все позиции заняты, возвращаем случайную
    return {
      x: baseX + Math.random() * 500,
      y: baseY + Math.random() * 300
    };
  }

  private findAppIdByPersistentId(persistentId: PersistentAppTypeId): any {
    const registeredApp = useRegisteredAppsStore.getState().getAppByPersistentAppId(persistentId);
    return registeredApp ? registeredApp.appId : null;
  }

  private async openFile(filePath: string): Promise<void> {
    const stats = await this.fileSystemAPI.stat(filePath);

    if (stats.isDirectory) {
      const explorerAppId = this.findAppIdByPersistentId('explorer' as PersistentAppTypeId);
      if (explorerAppId) {
        this.appAPI.startApp(explorerAppId, { initialPath: filePath });
      }
    } else {
      const extension = filePath.split('.').pop()?.toLowerCase();
      const associatedAppId = this.findAppByFileExtension(extension);
      if (associatedAppId) {
        this.appAPI.startApp(associatedAppId, { filePath });
      }
    }
  }

  private findAppByFileExtension(extension?: string): any {
    return null;
  }
}