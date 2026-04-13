import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import 'src/features/i18n';
import { SimonDifficulty as Difficulty } from '../../enums/simonDifficulty.enum';
import { SimonStatus } from '@Simon/enums/simonStatus.enum';
import { ChildrenNever } from '@Interfaces/childrenNever.interface';
import { Button } from '@Components/Button/Button';

import styles from './simonBar.module.css';
import { AppInstanceId } from '@nameless-os/sdk';
import { useSimonStore } from '@Simon/stores/simon.store';

interface Props extends ChildrenNever {
  difficulty: Difficulty;
  instanceId: AppInstanceId;
}

// eslint-disable-next-line react/display-name,react/prop-types
export const SimonBar: FC<Props> = React.memo(({ difficulty, instanceId }) => {
  const status = useSimonStore((store) => store.get(instanceId)!.simonStatus);
  const level = useSimonStore((store) => store.get(instanceId)!.level);
  const changeDifficulty = useSimonStore((store) => store.changeDifficulty);
  const restartGame = useSimonStore((store) => store.restartGame);
  const updateStatus = useSimonStore((store) => store.updateStatus);

  const { t } = useTranslation('simon');

  function startGame() {
    updateStatus(instanceId, SimonStatus.Showing);
  }

  function handleRestartGame() {
    restartGame(instanceId);
  }

  function handleChangeDifficulty() {
    changeDifficulty(instanceId, Difficulty.None);
  }

  return (
    <div className={styles.wrapper}>
      <div>
        <p>
          {t('difficulty')}
          {': '}
          {t(`difficulties.${difficulty}`)}
        </p>
        <p className={styles.level}>
          {t('level')}
          {': '}
          {level}
        </p>
      </div>
      {status === SimonStatus.Waiting && (
        <Button onClick={startGame} className={styles.btn}>
          {t('start')}
        </Button>
      )}
      {status === SimonStatus.Losed && (
        <div className={styles.buttons}>
          <Button onClick={handleChangeDifficulty} className={styles.btn}>
            {t('changeDifficulty')}
          </Button>
          <Button onClick={handleRestartGame} className={styles.btn}>
            {t('restart')}
          </Button>
        </div>
      )}
    </div>
  );
});
