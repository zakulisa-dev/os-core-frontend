import { useStartMenu } from '../../stores/startMenu.store';
import { useRegisteredAppsStore } from '../../api/app/appDefinitons.store';
import { useMemo, useRef } from 'react';
import { useClickAway } from 'react-use';
import styles from './startMenu.module.css';
import { systemApi } from '../../index';

const StartMenu = () => {
  const appsObj = useRegisteredAppsStore((s) => s.apps);
  const apps = useMemo(() => Object.values(appsObj), [appsObj]);
  const close = useStartMenu((s) => s.closeStartMenu);

  const menuRef = useRef<HTMLDivElement>(null);

  useClickAway(menuRef, () => {
    setTimeout(() => close(), 100);
  });

  const handleSystemAction = (action: string) => {
    const app = useRegisteredAppsStore.getState().getAppByPersistentAppId(action);
    systemApi.app.startApp(app?.appId);
    close();
  };

  return (
    <div ref={menuRef} className={styles.startMenu}>
      <div className={styles.sidePanel}>
        <div className={styles.sidePanelTop}>
          <button
            className={styles.systemButton}
            onClick={() => handleSystemAction('profile')}
            title="Profile"
          >
            <img src="assets/images/icons/profile.svg" alt=""/>
          </button>
        </div>
        <div className={styles.sidePanelBottom}>
          <button
            className={styles.systemButton}
            onClick={() => handleSystemAction('explorer')}
            title="Explorer"
          >
            <img src="assets/images/icons/explorer.svg" alt=""/>
          </button>
          <button
            className={styles.systemButton}
            onClick={() => handleSystemAction('settings')}
            title="Settings"
          >
            <img src="assets/images/icons/settings.svg" alt=""/>
          </button>
          <button
            className={styles.systemButton}
            onClick={() => handleSystemAction('power')}
            title="Power"
          >
            <img src="assets/images/icons/power.svg" alt=""/>
          </button>
        </div>
      </div>

      {/* Правая панель с приложениями */}
      <div className={styles.appsPanel}>
        {apps.map((app) => (
          <button
            key={app.appId}
            className={styles.menuItem}
            onClick={() => {
              systemApi.app.startApp(app.appId);
              close();
            }}
          >
            <img src={app.icon} className={styles.icon} alt={app.name} />
            <span>{app.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export { StartMenu };