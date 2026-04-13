import React, { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSignOutAlt,
  faUser,
  faAngry
} from '@fortawesome/free-solid-svg-icons';

import { WindowProps } from '@nameless-os/sdk';
import { ChildrenNever } from '@Interfaces/childrenNever.interface';
import { BottomTab } from '@Components/BottomTab/BottomTab';
import { Button } from '@Components/Button/Button';

import styles from './bottomPanel.module.css';
import { useStartMenu } from '../../stores/startMenu.store';
import { StartMenu } from '@Components/StartMenu/StartMenu';
import { useWindowManagerStore } from '../../api/windowManager/windowManager.store';
import { useBottomPanelStore } from '../../stores/useBottomPanel.store';

export const BottomPanel: FC<ChildrenNever> = () => {
  const username = '';
  const loading = false;
  const { pinnedApps, appOrder } = useBottomPanelStore();

  const navigate = useNavigate();

  function handleLogout(): void {
  }

  function handleLogin(): void {
    navigate('/login');
  }

  const toggle = useStartMenu((s) => s.toggleStartMenu)
  const isOpen = useStartMenu((s) => s.isStartMenuOpen)
  const windows = useWindowManagerStore((s) => s.windows);
  const sortedWindows = [...windows].sort((a, b) => a.createdAt - b.createdAt);
  const groupedWindows = Object.values(
    sortedWindows.reduce<Record<string, WindowProps[]>>((acc, win) => {
      const id = win.persistentAppTypeId;
      if (!acc[id]) acc[id] = [];
      acc[id].push(win);
      return acc;
    }, {})
  );
  const runningAppIds = [...new Set(windows.map((w) => w.persistentAppTypeId))];

  const allAppIds = Array.from(new Set([...pinnedApps, ...runningAppIds]));

  const sortedAppIds = allAppIds.sort((a, b) => {
    const indexA = appOrder.indexOf(a);
    const indexB = appOrder.indexOf(b);

    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  useEffect(() => {
    const allIds = [...new Set([...pinnedApps, ...runningAppIds])];
    const currentOrder = useBottomPanelStore.getState().appOrder;
    const missing = allIds.filter((id) => !currentOrder.includes(id));

    if (missing.length > 0) {
      useBottomPanelStore.getState().setAppOrder([...currentOrder, ...missing]);
    }
  }, [pinnedApps, runningAppIds]);

  return (
    <div className={styles.container}>
      <Button className={styles.tab} onClick={toggle}><img src="/assets/images/icons/mainMenu.svg" alt="main"/></Button>
      {isOpen && <StartMenu />}
      {sortedAppIds.map((appId) => {
        const group = groupedWindows.find(g => g[0].persistentAppTypeId === appId);
        return (
          <BottomTab
            key={appId}
            appId={appId}
            windows={group || []}
          />
        );
      })}
      {!loading &&
        (username !== '' ? (
          <Button onClick={handleLogout} className={styles.logBtn} aria-label="logout">
            <FontAwesomeIcon icon={faSignOutAlt} />
          </Button>
        ) : (
          <Button onClick={handleLogin} className={styles.logBtn} aria-label="login">
            <FontAwesomeIcon icon={faUser} />
          </Button>
        ))}
    </div>
  );
};
