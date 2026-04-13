import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import styles from '../mediaViewer.module.css';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <div className={styles.stateCenter}>
    <FontAwesomeIcon icon={faExclamationTriangle} className={styles.errIcon} />
    <div className={styles.stateText}>{error}</div>
    <button className={styles.primaryBtn} onClick={onRetry}>
      <FontAwesomeIcon icon={faRotateRight} />
      <span>Retry</span>
    </button>
  </div>
);