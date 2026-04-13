import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { faDeleteLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { CalculatorButton } from '@Calculator/components/CalculatorButton/CalculatorButton';
import { useCalculatorStore } from '../../stores/calculator.store';

import styles from './calculatorOperationButtons.module.css';
import { AppInstanceId } from '@nameless-os/sdk';

const operationButtons = ['+', '-', '*', '/', '^', '.'];

interface Props {
  instanceId: AppInstanceId;
}

const CalculatorOperationButtons: FC<Props> = React.memo(({ instanceId }) => {
  const { t } = useTranslation('calculator');

  const deleteLastCalculatorInputCharacter = useCalculatorStore((state) => state.deleteLastCalculatorInputCharacter);
  const clearCalculatorInput = useCalculatorStore((state) => state.clearCalculatorInput);
  const getCalculatorResultAndUpdateLastOperations = useCalculatorStore((state) => state.getCalculatorResultAndUpdateLastOperations);
  const addToCalculatorInput = useCalculatorStore((state) => state.addToCalculatorInput);

  function handleDeleteLastCharacter() {
    deleteLastCalculatorInputCharacter(instanceId);
  }

  function handleClearInput() {
    clearCalculatorInput(instanceId);
  }

  function handleSubmit() {
    getCalculatorResultAndUpdateLastOperations(instanceId);
  }

  function handleAddValueToInput(value: string) {
    addToCalculatorInput({ inputValue: value, instanceId });
  }

  return (
    <div className={styles.operationButtons}>
      {operationButtons.map(
        (value): ReactNode => (
          <div className={styles.operationButton} key={value}>
            <CalculatorButton value={value} handleClick={() => handleAddValueToInput(value)} label={value} />
          </div>
        ),
      )}
      <div className={styles.operationButton}>
        <CalculatorButton value="C" handleClick={handleClearInput} label={t('calculator.deleteAll')} />
      </div>
      <div className={styles.clearOneButton}>
        <CalculatorButton
          value={<FontAwesomeIcon icon={faDeleteLeft} />}
          handleClick={handleDeleteLastCharacter}
          label={t('calculator.deleteOne')}
        />
      </div>
      <div className={styles.enterButton}>
        <CalculatorButton value={t('calculator.enter')} handleClick={handleSubmit} label={t('calculator.enter')} />
      </div>
    </div>
  );
});

CalculatorOperationButtons.displayName = 'CalculatorOperationButtons';

export { CalculatorOperationButtons };
