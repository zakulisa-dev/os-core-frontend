import { findFirstOperatorIndex } from '../findFirstOperatorIndex';
import { findMaxDecimalLength } from '../findMaxDecimalLength';

function processMultiplyAndDivision(numbers: number[], operators: string[]): [number[], string[]] {
  const numbersCopy = [...numbers];
  const operatorsCopy = [...operators];

  let index = findFirstOperatorIndex('*', '/', operators);

  let decimalLength = 0;
  while (index !== -1) {
    decimalLength = 0;
    if (numbersCopy[index] % 1 || numbersCopy[index + 1] % 1) {
      decimalLength = findMaxDecimalLength(numbersCopy[index], numbersCopy[index + 1]);
    }
    if (operatorsCopy.indexOf('*') === index) {
      if (decimalLength) {
        numbersCopy[index] =
          (Math.round(numbersCopy[index] * 10 ** decimalLength) *
            Math.round(numbersCopy[index + 1] * 10 ** decimalLength)) /
          100 ** decimalLength;
      } else {
        numbersCopy[index] *= numbersCopy[index + 1];
      }
    } else if (decimalLength) {
      numbersCopy[index] =
        Math.round(numbersCopy[index] * 10 ** decimalLength) / Math.round(numbersCopy[index + 1] * 10 ** decimalLength);
    } else {
      numbersCopy[index] /= numbersCopy[index + 1];
    }
    numbersCopy.splice(index + 1, 1);
    operatorsCopy.splice(index, 1);
    index = findFirstOperatorIndex('*', '/', operatorsCopy);
  }

  return [numbersCopy, operatorsCopy];
}

export { processMultiplyAndDivision };
