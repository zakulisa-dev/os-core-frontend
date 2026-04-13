import { FC } from 'react';

import { ChildrenNever } from '@Interfaces/childrenNever.interface';

import styles from './username.module.css';

const Username: FC<ChildrenNever> = () => {
  const username = '';
  const loading = false;

  return <div className={styles.username}>{loading ? <p>Loading...</p> : <p>{username || 'Anonymous'}</p>}</div>;
};

export { Username };
