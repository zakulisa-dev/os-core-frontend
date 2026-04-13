import React from 'react';
import styles from '../mediaViewer.module.css';

export const LoadingState: React.FC = () => (
  <div className={styles.stateCenter}>
    <div className={styles.spinner} />
    <div className={styles.stateText}>Loading…</div>
  </div>
);