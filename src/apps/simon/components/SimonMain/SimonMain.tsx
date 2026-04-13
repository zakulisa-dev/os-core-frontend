import React, { FC, useEffect, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { SimonStatus } from '@Simon/enums/simonStatus.enum';
import sound1 from '@Sounds/simon/simon1.mp3';
import sound2 from '@Sounds/simon/simon2.mp3';
import sound3 from '@Sounds/simon/simon3.mp3';
import sound4 from '@Sounds/simon/simon4.mp3';
import sound5 from '@Sounds/simon/simon5.mp3';
import sound6 from '@Sounds/simon/simon6.mp3';
import sound7 from '@Sounds/simon/simon7.mp3';
import sound8 from '@Sounds/simon/simon8.mp3';
import sound9 from '@Sounds/simon/simon9.wav';
import { ChildrenNever } from '@Interfaces/childrenNever.interface';
import { SimonBar } from '@Simon/components/SimonBar/SimonBar';
import { SimonButton } from '@Simon/components/SimonButton/SimonButton';

import styles from './simonMain.module.css';
import { useSimonStore } from '@Simon/stores/simon.store';
import { AppInstanceId } from '@nameless-os/sdk';

interface Props extends ChildrenNever {
  numberOfButtons: number;
  instanceId: AppInstanceId;
}

const sounds = [sound1, sound2, sound3, sound4, sound5, sound6, sound7, sound8, sound9];

// eslint-disable-next-line react/display-name,react/prop-types
export const SimonMain: FC<Props> = React.memo(({ numberOfButtons, instanceId }) => {
  const status = useSimonStore((store) => store.get(instanceId)!.simonStatus);
  const pattern = useSimonStore((store) => store.get(instanceId)!.pattern);
  const level = useSimonStore((store) => store.get(instanceId)!.level);
  const difficulty = useSimonStore((store) => store.get(instanceId)!.difficulty);
  const simonClick = useSimonStore((store) => store.simonClick);
  const startShowing = useSimonStore((store) => store.startShowing);
  const updateStatus = useSimonStore((store) => store.updateStatus);
  const isSimonOpen = true;

  const btnRef1 = useRef<HTMLButtonElement>(null);
  const btnRef2 = useRef<HTMLButtonElement>(null);
  const btnRef3 = useRef<HTMLButtonElement>(null);
  const btnRef4 = useRef<HTMLButtonElement>(null);
  const btnRef5 = useRef<HTMLButtonElement>(null);
  const btnRef6 = useRef<HTMLButtonElement>(null);
  const btnRef7 = useRef<HTMLButtonElement>(null);
  const btnRef8 = useRef<HTMLButtonElement>(null);
  const btnRef9 = useRef<HTMLButtonElement>(null);

  const buttonsRefs = useMemo(
    () => [btnRef1, btnRef2, btnRef3, btnRef4, btnRef5, btnRef6, btnRef7, btnRef8, btnRef9],
    [],
  );
  const buttonsRefsWithLimit = buttonsRefs.slice(0, numberOfButtons);

  async function handleClick(numberOfButton: number): Promise<void> {
    await new Audio(sounds[numberOfButton]).play();
    setTimeout(() => buttonsRefs[numberOfButton]?.current?.classList.add(styles.btnActive), 0);
    setTimeout(() => buttonsRefs[numberOfButton]?.current?.classList.remove(styles.btnActive), 400);
    setTimeout(() => simonClick(instanceId, numberOfButton), 400);
  }

  useEffect(() => {
    if (status === SimonStatus.Showing) {
      if (pattern.length !== 3 + (level - 1)) {
        startShowing(instanceId);
      } else {
        pattern.forEach((el, index) => {
          setTimeout(
            async () => {
              await new Audio(sounds[el]).play();
            },
            900 * index + 900,
          );
          setTimeout(() => buttonsRefs[el]?.current?.classList.add(styles.btnActive), 900 * index + 900);
          setTimeout(() => buttonsRefs[el]?.current?.classList.remove(styles.btnActive), 900 * index + 1400);
        });
        setTimeout(
          () => {
            updateStatus(instanceId, SimonStatus.Playing);
          },
          900 * pattern.length + 400,
        );
      }
    }
  }, [isSimonOpen, pattern, level, status, sounds, buttonsRefs]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.buttons}>
        {buttonsRefsWithLimit.map((ref, index) => (
          <SimonButton
            instanceId={instanceId}
            btnRef={ref}
            handleClick={handleClick}
            btnNumber={index}
            numberOfButtons={numberOfButtons}
            key={uuidv4()}
          />
        ))}
      </div>
      <SimonBar instanceId={instanceId} difficulty={difficulty} />
    </div>
  );
});
