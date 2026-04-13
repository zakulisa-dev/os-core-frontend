function findFirstOperatorIndex(symbol1: string, symbol2: string, operators: string[]): number {
  if (
    (operators.indexOf(symbol1) < operators.indexOf(symbol2) && operators.indexOf(symbol1) !== -1) ||
    operators.indexOf(symbol2) === -1
  ) {
    return operators.indexOf(symbol1);
  }
  return operators.indexOf(symbol2);
}

export { findFirstOperatorIndex };
