import { deleteAllSpaces } from '@nameless-os/sdk';

import { checkIsCalculatorInputCorrect } from './checkIsCalculatorInputCorrect';
import { processPow } from './processes/processPow';
import { processAddAndSubtract } from './processes/processAddAndSubtract';
import { getNumbersFromInput } from './getNumbersFromInput';
import { processMultiplyAndDivision } from './processes/processMultiplyAndDivision';

function getCalcResult(inputValue: string): string {
  const inputValueWithoutSpaces = deleteAllSpaces(inputValue);

  if (!checkIsCalculatorInputCorrect(inputValueWithoutSpaces)) return 'Error';

  const numbers = getNumbersFromInput(inputValueWithoutSpaces);
  let input2 = '';
  if (inputValueWithoutSpaces[0] === '-') {
    input2 = inputValueWithoutSpaces.slice(1);
  } else {
    input2 = inputValueWithoutSpaces;
  }
  const operators = input2
    .replaceAll(/--/g, '-')
    .replaceAll(/\+-/g, '+')
    .replaceAll(/\*-/g, '*')
    .replaceAll(/\/-/g, '/')
    .replaceAll(/\^-/g, '^')
    .split(/[0-9,.]+/)
    .filter((el) => el.length);


  if (operators.length === 0) {
    return 'OpErr';
  }

  const [numbersAfterPowProcess, operatorsAfterPowProcess] = processPow(numbers, operators);

  const [numbersAfterMDProcess, operatorsAfterMDProcess] = processMultiplyAndDivision(
    numbersAfterPowProcess,
    operatorsAfterPowProcess,
  );

  const [numbersAfterASProcess] = processAddAndSubtract(numbersAfterMDProcess, operatorsAfterMDProcess);

  return typeof numbersAfterASProcess[0] === 'number' && !Number.isNaN(numbersAfterASProcess[0])
    ? numbersAfterASProcess[0].toString()
    : 'Error';
}

export { getCalcResult };
