import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Welcome } from '@Components/Welcome/Welcome';
import { ChildrenNever } from '@Interfaces/childrenNever.interface';
import { Background } from '@Features/settings/enums';
import { Button } from '@Components/Button/Button';
import { Window } from '@Components/Window/Window';

import styles from './main.module.css';
import { useWindowManagerStore } from '../../api/windowManager/windowManager.store';
import { AltTabOverlay } from '@Components/AltTabOverlay/AltTabOverlay';
import { Toaster } from 'sonner';
import { iconManagerInstance, systemApi } from '../../index';
import { useBackground } from '@Settings/stores/settings.store';
import { AppInstanceId, WindowId } from '@nameless-os/sdk';
import { useIconStore } from '@Features/icon/stores/icon.store';
import { DesktopIcon } from '@Features/icon/ui/DesktopIcon';
import { backgroundImagesAssets } from '@Constants/backgroundImages';

// Интерфейс для данных drag
interface FileDragData {
  filePath: string;
  name: string;
  isDirectory: boolean;
}

const Main: FC<ChildrenNever> = () => {
  const backgroundImage = useBackground();
  const [themeBackground, setThemeBackground] = useState('');
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(!sessionStorage.getItem('isWelcomeOpen'));
  const [modalX, setModalX] = useState(0);
  const [modalY, setModalY] = useState(0);
  const [isModalOpen, setModalOpen] = useState(false);
  const [altTabVisible, setAltTabVisible] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const windows = useWindowManagerStore(state => state.windows);
  const { icons, selectedIcons, selectIcon, clearSelection } = useIconStore();

  function focusWindowById(id: WindowId) {
    systemApi.windowManager.focusWindow(id);
    setAltTabVisible(false);
  }

  // Обработчики drag&drop для создания ярлыков
  const handleDesktopDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();

    // Проверяем, что это drag файла из FileExplorer
    if (e.dataTransfer.types.includes('application/file-shortcut')) {
      e.dataTransfer.dropEffect = 'copy';
      setIsDragOver(true);
    }
  }, []);

  const handleDesktopDragLeave = useCallback((e: React.DragEvent) => {
    // Проверяем, что мы действительно покинули область desktop
    if (e.relatedTarget instanceof Node && !e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDesktopDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    // Проверяем, что это drag файла из FileExplorer
    const fileShortcutData = e.dataTransfer.getData('application/file-shortcut');
    if (!fileShortcutData) return;

    try {
      const dragData: FileDragData = JSON.parse(fileShortcutData);

      // Получаем координаты drop относительно desktop
      const desktopRect = e.currentTarget.getBoundingClientRect();
      const dropPosition = {
        x: e.clientX - desktopRect.left,
        y: e.clientY - desktopRect.top
      };

      // Проверяем, что не создаем дубликат ярлыка
      const existingShortcut = icons.find(icon =>
        icon.filePath === dragData.filePath
      );

      if (existingShortcut) {
        console.log('Shortcut for this file already exists');
        return;
      }

      // Создаем ярлык через IconManager
      await iconManagerInstance.createShortcutFromPath(dragData.filePath, dropPosition);

      // Сохраняем состояние desktop
      await iconManagerInstance.saveDesktopState();

    } catch (error) {
      console.error('Failed to create shortcut:', error);
    }
  }, [icons]);

  const handleDesktopClick = useCallback((e: React.MouseEvent) => {
    // Очищаем выделение иконок при клике на пустое место desktop
    if (e.target === e.currentTarget) {
      clearSelection();
    }

    // Закрываем контекстное меню
    if (isModalOpen) {
      setModalOpen(false);
    }
  }, [clearSelection, isModalOpen]);

  useEffect(() => {
    setThemeBackground(backgroundImagesAssets[backgroundImage]);
  }, [backgroundImage, backgroundImagesAssets]);

  useEffect(() => {
    // Загружаем состояние desktop при запуске
    iconManagerInstance.loadDesktopState();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.code === 'KeyQ')) {
        e.preventDefault();
        setAltTabVisible(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        setAltTabVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleWelcomeClose = useCallback(() => {
    setIsWelcomeOpen(false);
    sessionStorage.setItem('isWelcomeOpen', 'No');
    setTimeout(() => {
      return systemApi.sound.playUrl('/assets/sounds/startup.mp3', {
        volume: 0.3,
        appId: undefined as unknown as AppInstanceId,
      });
    }, 1000);
  }, []);

  function handleContext(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();

    if (!(event.target instanceof HTMLElement) || event.target.id !== 'main-container') {
      return;
    }

    setModalX(event.pageX);
    setModalY(event.pageY);
    setModalOpen(true);
  }

  function handleAddIcon() {
  }

  return (
    <div
      style={{ backgroundImage: `url(${themeBackground})` }}
      className={`${styles.container} ${isDragOver ? styles.dragOver : ''}`}
      id="main-container"
      onContextMenu={handleContext}
      onDragOver={handleDesktopDragOver}
      onDragLeave={handleDesktopDragLeave}
      onDrop={handleDesktopDrop}
      onClick={handleDesktopClick}
    >
      <AnimatePresence>{isWelcomeOpen && <Welcome handleWelcomeClose={handleWelcomeClose}/>}</AnimatePresence>
      {isModalOpen && (
        <div style={{ position: 'absolute', zIndex: 2, top: modalY, left: modalX }} className={styles.createIconModal1}>
          <div className={styles.createIconModal1Buttons}>
            <Button onClick={handleAddIcon}>Add Icon</Button>
          </div>
        </div>
      )}
      <div>
        {windows.map((win) => {
          return !win.minimized && <Window key={win.id} windowProps={win}/>
        })}
      </div>
      <div className={styles.desktop}>
        {icons.map(icon => (
          <DesktopIcon
            key={icon.id}
            icon={icon}
            selected={selectedIcons.includes(icon.id)}
            onDoubleClick={() => iconManagerInstance.executeIcon(icon.id)}
            onSelect={(multiSelect) => selectIcon(icon.id, multiSelect)}
          />
        ))}
      </div>

      {/* Overlay для drag feedback */}
      {isDragOver && (
        <div className={styles.dragOverlay}>
          <div className={styles.dragOverlayContent}>
            <div className={styles.dragOverlayIcon}>🔗</div>
            <div className={styles.dragOverlayText}>Drop to create shortcut</div>
          </div>
        </div>
      )}

      <AltTabOverlay
        windows={windows}
        visible={altTabVisible}
        onSelect={focusWindowById}
      />
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        duration={5000}
      />
    </div>
  );
};

export { Main };