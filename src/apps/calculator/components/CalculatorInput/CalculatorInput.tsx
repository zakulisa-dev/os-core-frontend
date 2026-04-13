import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './calculatorInput.module.css';
import { AppInstanceId } from '@nameless-os/sdk';
import { useCalculatorStore } from '../../stores/calculator.store';

interface Props {
  instanceId: AppInstanceId;
}

const CalculatorInput: FC<Props> = ({ instanceId }) => {
  const { t } = useTranslation('calculator');

  const calculatorData = useCalculatorStore((state) => state.get(instanceId));
  const setCalculatorInput = useCalculatorStore((state) => state.setCalculatorInput);
  const getCalculatorResultAndUpdateLastOperations = useCalculatorStore(
    (state) => state.getCalculatorResultAndUpdateLastOperations
  );

  const inputValue = calculatorData?.inputValue || '';

  function handleChangeInput(event: React.ChangeEvent<HTMLInputElement>) {
    const numbersAndOperatorsRegExp = new RegExp(/^[\d+\-*^./\s]*$/);
    if (numbersAndOperatorsRegExp.test(event.target.value)) {
      setCalculatorInput({ inputValue: event.target.value, instanceId });
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    getCalculatorResultAndUpdateLastOperations(instanceId);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} aria-label={t('calculator.enter')}>
      <input
        autoFocus
        type="text"
        className={`${styles.input} ${inputValue === 'Error' ? styles.error : ''}`}
        value={inputValue !== 'Error' && inputValue !== 'Infinity' ? inputValue : ''}
        placeholder={inputValue === 'Error' || inputValue === 'Infinity' ? inputValue : ''}
        onChange={handleChangeInput}
        aria-label={t('calculator.inputAriaLabel')}
      />
    </form>
  );
};

export { CalculatorInput };