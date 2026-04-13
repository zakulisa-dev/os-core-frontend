import { FC } from 'react';
import styles from '../fileExplorer.module.css';

interface DragDropOverlayProps {
  visible: boolean;
  currentPath: string;
}

export const DragDropOverlay: FC<DragDropOverlayProps> = ({ visible, currentPath }) => {
  if (!visible) return null;

  return (
    <div className={styles.dragDropOverlay}>
      <div className={styles.dragDropContent}>
        <div className={styles.dragDropIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
          </svg>
        </div>
        <div className={styles.dragDropText}>Drop files here to upload</div>
        <div className={styles.dragDropSubtext}>Files will be uploaded to {currentPath}</div>
      </div>
    </div>
  );
};