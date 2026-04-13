import React, { FC } from 'react';

import { ChildrenNever } from '@Interfaces/childrenNever.interface';

import { DEFAULT_IMAGE_LINK } from './constants/defaultImageLink';
import styles from './avatar.module.css';

interface Props extends ChildrenNever {
  link?: string;
  height?: number;
  width?: number;
  name: string;
}

const AvatarComponent: FC<Props> = ({ link, name, height = 56, width = 56 }: Props) => {
  if (link) {
    return (
      <img src={link || DEFAULT_IMAGE_LINK} alt="avatar" className={styles.avatar} width={width} height={height} />
    );
  }

  return (
    <div style={{ width: `${width}px`, height: `${height}px` }} className={styles.avatarContainer}>
      {name[0].toUpperCase()}
    </div>
  );
};

const Avatar = React.memo(AvatarComponent);

export { Avatar };
