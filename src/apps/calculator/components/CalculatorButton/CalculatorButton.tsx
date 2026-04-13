import React, { FC, ReactNode } from 'react';

import { ChildrenNever } from '@Interfaces/childrenNever.interface';
import { Button } from '@Components/Button/Button';

import styles from './calculatorButton.module.css';

interface Props extends ChildrenNever {
  value: string | ReactNode;
  handleClick: () => void;
  label: string;
}

const CalculatorButton: FC<Props> = React.memo(({ value, handleClick, label }: Props) => (
  <Button className={styles.button} onClick={handleClick} aria-label={label}>
    {value}
  </Button>
));

CalculatorButton.displayName = 'CalculatorButton';

export { CalculatorButton };
