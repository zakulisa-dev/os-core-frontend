import { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faThLarge } from '@fortawesome/free-solid-svg-icons';
import { ViewMode } from '../types';
import styles from '../fileExplorer.module.css';

interface ViewSwitcherProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const ViewSwitcher: FC<ViewSwitcherProps> = ({ viewMode, onViewModeChange }) => {
  return (
    <div className={styles.viewSwitcher}>
      <button
        className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
        onClick={() => onViewModeChange('list')}
        title="List view"
      >
        <FontAwesomeIcon icon={faList} />
      </button>
      <button
        className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
        onClick={() => onViewModeChange('grid')}
        title="Grid view"
      >
        <FontAwesomeIcon icon={faThLarge} />
      </button>
    </div>
  );
};