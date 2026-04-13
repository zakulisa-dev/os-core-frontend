import { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FileEntry } from '@nameless-os/sdk';
import { formatFileSize } from '../utils';
import styles from '../fileExplorer.module.css';

interface StatusBarProps {
  items: FileEntry[];
  selectedItems: Set<string>;
  error: string;
  onClearError: () => void;
}

export const StatusBar: FC<StatusBarProps> = ({ items, selectedItems, error, onClearError }) => {
  if (error) {
    return (
      <div className={`${styles.statusBar} ${styles.error}`}>
        <span>Error: {error}</span>
        <button onClick={onClearError} className={styles.closeError}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    );
  }

  const selectedCount = selectedItems.size;
  const totalCount = items.length;

  const selectedSize = items
    .filter((item) => selectedItems.has(item.name) && !item.stats.isDirectory)
    .reduce((sum, item) => sum + item.stats.size, 0);

  return (
    <div className={styles.statusBar}>
      <span>
        {selectedCount > 0
          ? `${selectedCount} selected (${formatFileSize(selectedSize)})`
          : `${totalCount} items`}
      </span>
    </div>
  );
};