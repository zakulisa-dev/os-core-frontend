import React, { FC } from 'react';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { ChildrenNever } from '@Interfaces/childrenNever.interface';
import { Button } from '@Components/Button/Button';

import styles from './error.module.css';

interface Props extends ChildrenNever {
  refetch: () => void;
}

const Error: FC<Props> = React.memo(({ refetch }: Props) => (
  <div className={styles.errorContainer}>
    Error, try again later
    <Button onClick={refetch}>
      <FontAwesomeIcon icon={faArrowsRotate} />
    </Button>
  </div>
));

Error.displayName = 'Error';

export { Error };
