import { FC } from 'react';
import { UploadProgressItem } from '../types';
import styles from '../fileExplorer.module.css';

interface UploadProgressProps {
  uploadProgress: Record<string, UploadProgressItem>;
  onClose: () => void;
}

export const UploadProgress: FC<UploadProgressProps> = ({ uploadProgress, onClose }) => {
  const uploads = Object.entries(uploadProgress);
  if (uploads.length === 0) return null;

  return (
    <div className={styles.uploadProgress}>
      <div className={styles.uploadHeader}>
        <span>Uploading files...</span>
        <button onClick={onClose} className={styles.uploadClose}>
          ×
        </button>
      </div>
      {uploads.map(([fileName, progress]) => (
        <div key={fileName} className={styles.uploadItem}>
          <div className={styles.uploadInfo}>
            <span className={styles.uploadName}>{fileName}</span>
            <span className={`${styles.uploadStatus} ${styles[progress.status]}`}>
              {progress.status === 'uploading' && '⏳'}
              {progress.status === 'completed' && '✅'}
              {progress.status === 'error' && '❌'}
            </span>
          </div>
          {progress.status === 'error' && <div className={styles.uploadError}>{progress.error}</div>}
        </div>
      ))}
    </div>
  );
};