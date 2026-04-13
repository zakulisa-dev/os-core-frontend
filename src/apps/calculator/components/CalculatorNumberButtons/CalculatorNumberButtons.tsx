import React, { FC, ReactNode } from 'react';

import { CalculatorButton } from '@Calculator/components/CalculatorButton/CalculatorButton';
import { useCalculatorStore } from '../../stores/calculator.store';

import styles from './calculatorNumberButtons.module.css';
import { AppInstanceId } from '@nameless-os/sdk';

const numberButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

interface Props {
  instanceId: AppInstanceId;
}

const CalculatorNumberButtons: FC<Props> = React.memo(({ instanceId }) => {
  const addToCalculatorInput = useCalculatorStore((state) => state.addToCalculatorInput);

  function handleAddValueToInput(value: string) {
    addToCalculatorInput({ inputValue: value, instanceId });
  }

  return (
    <div className={styles.numberButtons}>
      {numberButtons.map(
        (value): ReactNode => (
          <div className={styles.numberButton} key={value}>
            <CalculatorButton value={value} handleClick={() => handleAddValueToInput(value)} label={value} />
          </div>
        ),
      )}
      <div className={styles.zeroButton}>
        <CalculatorButton value="0" handleClick={() => handleAddValueToInput('0')} label="0" />
      </div>
    </div>
  );
});

CalculatorNumberButtons.displayName = 'CalculatorNumberButtons';

export { CalculatorNumberButtons };
