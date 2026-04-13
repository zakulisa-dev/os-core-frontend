import React, { FC, useLayoutEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCompress, faExpand } from '@fortawesome/free-solid-svg-icons';

import { ChildrenNever } from '@Interfaces/childrenNever.interface';
import { Button } from '@Components/Button/Button';

import styles from './fullscreenButton.module.css';

export const FullscreenButton: FC<ChildrenNever> = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useLayoutEffect(() => {
    const toggleFullscreen = () => {
      setIsFullscreen((prevState) => !prevState);
    };

    document.addEventListener('fullscreenchange', toggleFullscreen);
    return () => document.removeEventListener('fullscreenchange', toggleFullscreen);
  }, []);

  async function handleFullscreen(): Promise<void> {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }

  return (
    <Button
      onClick={handleFullscreen}
      id="fullscreen-btn"
      className={styles.fullscreenButtonContainer}
      aria-label="toggle fullscreen"
    >
      {isFullscreen ? (
        <FontAwesomeIcon icon={faCompress} className={styles.fullscreenButton} />
      ) : (
        <FontAwesomeIcon icon={faExpand} className={styles.fullscreenButton} />
      )}
    </Button>
  );
};
