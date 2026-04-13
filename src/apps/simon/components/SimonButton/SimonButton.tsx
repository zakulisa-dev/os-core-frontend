import React, { FC, RefObject } from 'react';

import { SimonStatus } from '@Simon/enums/simonStatus.enum';
import { ChildrenNever } from '@Interfaces/childrenNever.interface';
import { Button } from '@Components/Button/Button';

import styles from './simonButton.module.css';
import { useSimonStore } from '@Simon/stores/simon.store';
import { AppInstanceId } from '@nameless-os/sdk';

interface Props extends ChildrenNever {
  btnRef: RefObject<null | HTMLButtonElement>;
  btnNumber: number;
  handleClick: (btnNumber: number) => void;
  numberOfButtons: number;
  instanceId: AppInstanceId;
}

// eslint-disable-next-line react/display-name,react/prop-types
const SimonButton: FC<Props> = React.memo(({ instanceId, btnRef, btnNumber, handleClick, numberOfButtons }) => {
  const status = useSimonStore((store) => store.get(instanceId)!.simonStatus);

  return (
    <Button
      disabled={status !== SimonStatus.Playing}
      forwardedRef={btnRef}
      onClick={() => handleClick(btnNumber)}
      aria-label="simon-button"
      className={styles[`btn${numberOfButtons}`]}
    />
  );
});

export { SimonButton };
