import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { SimonMain } from '@Simon/components/SimonMain/SimonMain';
import { Button } from '@Components/Button/Button';
import { SimonDifficulty } from '@Simon/enums/simonDifficulty.enum';

import styles from './simon.module.css';
import { useSimonStore } from '@Simon/stores/simon.store';
import { AppInstanceId } from '@nameless-os/sdk';

// eslint-disable-next-line react/display-name,react/prop-types
export const Simon: FC<{ instanceId: AppInstanceId }> = React.memo(({ instanceId }) => {
  const difficulty = useSimonStore((state) => state.get(instanceId)!.difficulty);
  const changeDifficulty = useSimonStore((state) => state.changeDifficulty);
  const { t } = useTranslation('simon');

  const chooseDifficulty = (chosenDifficulty: SimonDifficulty) => {
    changeDifficulty(instanceId, chosenDifficulty);
  };

  return (
    <>
      {difficulty === SimonDifficulty.None && (
        <div className={styles.difficulties}>
          <h2>{t('chooseDifficulty')}:</h2>
          <ul className={styles.difficultiesList}>
            <li>
              <Button onClick={() => chooseDifficulty(SimonDifficulty.Easy)} className={styles.difficultyButton}>
                {t(`difficulties.${SimonDifficulty.Easy}`)}
              </Button>
            </li>
            <li>
              <Button onClick={() => chooseDifficulty(SimonDifficulty.Medium)} className={styles.difficultyButton}>
                {t(`difficulties.${SimonDifficulty.Medium}`)}
              </Button>
            </li>
            <li>
              <Button onClick={() => chooseDifficulty(SimonDifficulty.Hard)} className={styles.difficultyButton}>
                {t(`difficulties.${SimonDifficulty.Hard}`)}
              </Button>
            </li>
            <li>
              <Button onClick={() => chooseDifficulty(SimonDifficulty.Extreme)} className={styles.difficultyButton}>
                {t(`difficulties.${SimonDifficulty.Extreme}`)}
              </Button>
            </li>
          </ul>
        </div>
      )}
        {(difficulty === SimonDifficulty.Easy || difficulty === SimonDifficulty.Medium) &&
          <SimonMain numberOfButtons={4} instanceId={instanceId}/>}
        {(difficulty === SimonDifficulty.Hard || difficulty === SimonDifficulty.Extreme) &&
          <SimonMain numberOfButtons={9} instanceId={instanceId}/>}
    </>
  );
});
