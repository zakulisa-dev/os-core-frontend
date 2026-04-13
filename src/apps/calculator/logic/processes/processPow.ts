function processPow(numbers: number[], operators: string[]): [number[], string[]] {
  const numbersCopy = [...numbers];
  const operatorsCopy = [...operators];

  let index = operatorsCopy.lastIndexOf('^');

  while (index !== -1) {
    numbersCopy[index] **= numbersCopy[index + 1];
    numbersCopy.splice(index + 1, 1);
    operatorsCopy.splice(index, 1);
    index = operatorsCopy.lastIndexOf('^');
  }
  return [numbersCopy, operatorsCopy];
}

export { processPow };
