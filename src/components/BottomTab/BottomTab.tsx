import React, { FC, memo, useRef, useState } from 'react';

import { WindowProps } from '@nameless-os/sdk';
import { ChildrenNever } from '@Interfaces/childrenNever.interface';
import { Button } from '@Components/Button/Button';

import styles from './bottomTab.module.css';
import { useRegisteredAppsStore } from '../../api/app/appDefinitons.store';
import { useBottomPanelStore } from 'src/stores/useBottomPanel.store';
import { systemApi } from '../../index';

interface Props extends ChildrenNever {
  appId: string;
  windows: WindowProps[];
}

const BottomTab: FC<Props> = memo(({ appId, windows }: Props) => {
  const appDefinition = useRegisteredAppsStore((s) => s.getAppByPersistentAppId(appId));
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const focused = windows.some((w) => w.focused);
  const minimizedOnly = windows.every((w) => w.minimized);

  const isPinned = useBottomPanelStore((s) => s.isPinned(appId));
  const pin = useBottomPanelStore((s) => s.pinApp);
  const unpin = useBottomPanelStore((s) => s.unpinApp);

  if (!appDefinition) return null;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsContextMenuOpen(true);
  };

  const handleTogglePin = () => {
    if (isPinned) {
      unpin(appId);
    } else {
      pin(appId);
    }
    setIsContextMenuOpen(false);
  };

  const handleCloseAll = () => {
    windows.forEach((win) => {
      systemApi.windowManager.closeWindow(win.id);
    });
    setIsContextMenuOpen(false);
  };

  const handleClick = (event: React.MouseEvent) => {
    if (event.shiftKey) {
      systemApi.app.startApp(appDefinition.appId);
      return;
    }

    if (windows.length === 0) {
      systemApi.app.startApp(appDefinition.appId);
      return;
    }

    if (minimizedOnly) {
      systemApi.windowManager.restoreWindow(windows[0].id);
    } else if (!focused) {
      systemApi.windowManager.focusWindow(windows[0].id);
    } else {
      systemApi.windowManager.minimizeWindow(windows[0].id);
    }
  };

  if (windows.length <= 1) {
    return (
      <div data-cy="bottom-tab" className={styles.container}>
        <Button
          className={`${styles.tab} ${windows.length > 0 ? styles.open : ''} ${focused ? styles.isActive : ''} ${windows.length === 0 ? styles.pinned : ''}`}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          title={`${appDefinition.name} (${windows.length})`}
        >
          <div className={styles.icon}>
            <img src={appDefinition.icon} alt="" />
          </div>
        </Button>
        {isContextMenuOpen && (
          <div
            className={styles.contextMenu}
            ref={menuRef}
          >
            <button className={styles.menuItem} onClick={handleCloseAll}>Закрыть окно</button>
            <button className={styles.menuItem} onClick={handleTogglePin}>Закрепить</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div data-cy="bottom-tab" className={styles.multipleButton}>
      <Button
        onContextMenu={handleContextMenu}
        className={`${styles.tab} ${styles.leftButtonSegment} ${windows.length > 0 ? styles.open : ''} ${focused ? styles.isActive : ''}`}
        onClick={handleClick}
        title={`${appDefinition.name} (${windows.length})`}
      >
        <div className={styles.icon}>
          <img src={appDefinition.icon} alt="" />
        </div>
      </Button>
      <div className={styles.rightButtonSegment}>
        <div className={styles.rightTopSegment}></div>
        <div className={styles.rightBottomSegment}></div>
      </div>
      {isContextMenuOpen && (
        <div
          className={styles.contextMenu}
          ref={menuRef}
        >
          <button className={styles.menuItem} onClick={handleCloseAll}>Закрыть все окна</button>
          <button className={styles.menuItem} onClick={handleTogglePin}>Закрепить</button>
        </div>
      )}
    </div>
  );
});

BottomTab.displayName = 'BottomTab';

export { BottomTab };
