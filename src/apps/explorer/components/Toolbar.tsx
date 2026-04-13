import { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faArrowUp,
  faHome,
  faRefresh,
  faPlus,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import styles from '../fileExplorer.module.css';

interface ToolbarProps {
  canGoBack: boolean;
  canGoForward: boolean;
  canGoUp: boolean;
  hasSelection: boolean;
  currentPath: string;
  onGoBack: () => void;
  onGoForward: () => void;
  onGoUp: () => void;
  onGoHome: () => void;
  onRefresh: () => void;
  onNewItem: () => void;
  onDelete: () => void;
  onPathChange: (path: string) => void;
  onPathSubmit: (path: string) => void;
}

export const Toolbar: FC<ToolbarProps> = ({
                                            canGoBack,
                                            canGoForward,
                                            canGoUp,
                                            hasSelection,
                                            currentPath,
                                            onGoBack,
                                            onGoForward,
                                            onGoUp,
                                            onGoHome,
                                            onRefresh,
                                            onNewItem,
                                            onDelete,
                                            onPathChange,
                                            onPathSubmit,
                                          }) => {
  return (
    <div className={styles.toolbar}>
      <div className={styles.navButtons}>
        <button
          className={styles.navBtn}
          onClick={onGoBack}
          disabled={!canGoBack}
          title="Back"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <button
          className={styles.navBtn}
          onClick={onGoForward}
          disabled={!canGoForward}
          title="Forward"
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
        <button
          className={styles.navBtn}
          onClick={onGoUp}
          disabled={!canGoUp}
          title="Up"
        >
          <FontAwesomeIcon icon={faArrowUp} />
        </button>
        <button className={styles.navBtn} onClick={onGoHome} title="Home">
          <FontAwesomeIcon icon={faHome} />
        </button>
        <button className={styles.navBtn} onClick={onRefresh} title="Refresh">
          <FontAwesomeIcon icon={faRefresh} />
        </button>
      </div>

      <div className={styles.addressBar}>
        <input
          type="text"
          value={currentPath}
          onChange={(e) => onPathChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const value = (e.target as HTMLInputElement).value.trim();
              if (value) {
                onPathSubmit(value);
              }
            }
          }}
          className={styles.pathInput}
        />
      </div>

      <div className={styles.actionButtons}>
        <button className={styles.actionBtn} onClick={onNewItem} title="New">
          <FontAwesomeIcon icon={faPlus} />
        </button>
        <button
          className={styles.actionBtn}
          onClick={onDelete}
          disabled={!hasSelection}
          title="Delete"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </div>
  );
};