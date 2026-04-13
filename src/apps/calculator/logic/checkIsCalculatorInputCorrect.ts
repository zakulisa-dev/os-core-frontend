function checkIsCalculatorInputCorrect(inputValue: string): boolean {
  if (!inputValue.length) {
    return false;
  }

  const operatorRegExp = new RegExp(/[+*/^.]/);
  const operatorsInRowRegExp = new RegExp(/[+*/^.]{2,}/);
  const minusesInRowRegExp = new RegExp(/[-]{3,}/);
  const hasNumberRegExp = new RegExp(/\d/);
  const onlyOperatorsAndNumbersRegExp = new RegExp(/^[\d+\-*^./\s]*$/g);

  return !(
    !onlyOperatorsAndNumbersRegExp.test(inputValue) ||
    operatorRegExp.test(inputValue[0]) ||
    inputValue.startsWith('--') ||
    operatorsInRowRegExp.test(inputValue) ||
    minusesInRowRegExp.test(inputValue) ||
    !hasNumberRegExp.test(inputValue)
  );
}

export { checkIsCalculatorInputCorrect };
