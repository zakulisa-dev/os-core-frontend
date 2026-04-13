import { FC } from 'react';
import { v4 as uuid4 } from 'uuid';

import styles from './calculatorLastOperationsList.module.css';
import { AppInstanceId } from '@nameless-os/sdk';
import { useCalculatorStore } from '../../stores/calculator.store';

interface Props {
  instanceId: AppInstanceId;
}

const CalculatorLastOperationsList: FC<Props> = ({ instanceId }) => {
  const lastOperations = useCalculatorStore((state) =>
    state.get(instanceId)?.lastOperations || ['', '', '']
  );

  return (
    <ul className={styles.operationHistory}>
      {lastOperations.map((el, index) => (
        <li className={styles[`operation${index}`]} key={uuid4()}>
          {el}
        </li>
      ))}
    </ul>
  );
};

export { CalculatorLastOperationsList };