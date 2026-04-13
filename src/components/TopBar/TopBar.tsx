import { FC } from 'react';

import { FullscreenButton } from '@Components/FullscreenButton/FullscreenButton';
import { Username } from '@Components/Username/Username';
import { TopDate } from '@Components/TopDate/TopDate';
import { ChildrenNever } from '@Interfaces/childrenNever.interface';

import styles from './topBar.module.css';

export const TopBar: FC<ChildrenNever> = () => (
  <div className={styles.container} id="top-bar">
    <TopDate />
    <Username />
    <FullscreenButton />
  </div>
);
