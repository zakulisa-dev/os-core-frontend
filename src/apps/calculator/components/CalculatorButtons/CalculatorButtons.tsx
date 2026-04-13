import React, { FC } from 'react';

import { CalculatorNumberButtons } from '@Calculator/components/CalculatorNumberButtons/CalculatorNumberButtons';
import { CalculatorOperationButtons } from '@Calculator/components/CalculatorOperationButtons/CalculatorOperationButtons';

import styles from './calculatorButtons.module.css';
import { AppInstanceId } from '@nameless-os/sdk';

interface Props {
  instanceId: AppInstanceId;
}

const CalculatorButtons: FC<Props> = React.memo(({ instanceId }) => (
  <div className={styles.wrapper}>
    <div className={styles.buttons}>
      <CalculatorNumberButtons instanceId={instanceId} />
      <CalculatorOperationButtons instanceId={instanceId} />
    </div>
  </div>
));

CalculatorButtons.displayName = 'CalculatorButtons';

export { CalculatorButtons };
