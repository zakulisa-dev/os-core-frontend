import { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from '../fileExplorer.module.css';

interface ConfirmDialogProps {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: FC<ConfirmDialogProps> = ({ show, title, message, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className={styles.dialogOverlay}>
      <div className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <h3>{title}</h3>
          <button onClick={onCancel} className={styles.dialogClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className={styles.dialogBody}>
          <p>{message}</p>
        </div>
        <div className={styles.dialogFooter}>
          <button onClick={onCancel} className={styles.btnCancel}>
            Cancel
          </button>
          <button onClick={onConfirm} className={styles.btnDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};