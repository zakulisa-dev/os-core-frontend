function getNumbersFromInput(value: string): number[] {
  const numbers: number[] = [];
  const splitValue = value.split('');
  let currentNumber = '';
  for (let i = 0; i < splitValue.length; i++) {
    if (!/[\d.]/.test(splitValue[i])) {
      if (splitValue[i] === '-' && (i === 0 || !/[\d.]/.test(splitValue[i - 1]))) {
        currentNumber += '-';
        continue;
      }
      numbers.push(+currentNumber);
      currentNumber = '';
      continue;
    }
    currentNumber += splitValue[i];
    if (i === splitValue.length - 1) {
      numbers.push(+currentNumber);
      currentNumber = '';
    }
  }
  return numbers;
}

export { getNumbersFromInput };
