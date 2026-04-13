import React, { FC } from 'react';
import { CalculatorButtons } from '@Calculator/components/CalculatorButtons/CalculatorButtons';
import { CalculatorInput } from '@Calculator/components/CalculatorInput/CalculatorInput';
import {
  CalculatorLastOperationsList,
} from '@Calculator/components/CalculatorLastOperationsList/CalculatorLastOperationsList';
import styles from './calculator.module.css';
import { AppInstanceId } from '@nameless-os/sdk';

interface CalculatorComponentProps {
  instanceId: AppInstanceId;
}

const CalculatorComponent: FC<CalculatorComponentProps> = ({ instanceId }) => (
  <div className={styles.container}>
    <CalculatorInput instanceId={instanceId}/>
    <CalculatorLastOperationsList instanceId={instanceId}/>
    <CalculatorButtons instanceId={instanceId}/>
  </div>
);

const Calculator = React.memo(CalculatorComponent);

export { Calculator };
