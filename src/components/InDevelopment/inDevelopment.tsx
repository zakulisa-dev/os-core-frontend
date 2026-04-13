import React, { FC } from 'react';

import { ChildrenNever } from '@Interfaces/childrenNever.interface';

import styles from './inDevelopment.module.css';

const InDevelopment: FC<ChildrenNever> = React.memo(() => (
  <div className={styles.container}>
    <p>In development</p>
  </div>
));

InDevelopment.displayName = 'InDevelopment';

export { InDevelopment };
