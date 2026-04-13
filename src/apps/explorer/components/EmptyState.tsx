import { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import styles from '../fileExplorer.module.css';

interface EmptyStateProps {
  searchQuery?: string;
}

export const EmptyState: FC<EmptyStateProps> = ({ searchQuery }) => {
  const message = searchQuery
    ? `No files match "${searchQuery}"`
    : 'This folder is empty';

  return (
    <div className={styles.emptyState}>
      <FontAwesomeIcon icon={faFolderOpen} className={styles.emptyIcon} />
      <div className={styles.emptyText}>{message}</div>
    </div>
  );
};