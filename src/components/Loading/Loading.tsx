import React, { FC } from 'react';
import { ChildrenNever } from '@Interfaces/childrenNever.interface';

import styles from './loading.module.css';

const LoadingComponent: FC<ChildrenNever> = () => (
  <div className={styles.loadingRing}>
    <div />
    <div />
    <div />
    <div />
  </div>
);

const Loading = React.memo(LoadingComponent);

export { Loading };
