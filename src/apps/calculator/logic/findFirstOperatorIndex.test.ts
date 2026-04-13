import { findFirstOperatorIndex } from '@Calculator/logic/findFirstOperatorIndex';

describe('calculator findFirstOperatopIndex', () => {
  it('should return first operator index if it index < second operator index', () => {
    const result = findFirstOperatorIndex('+', '-', ['+', '-', '+']);
    expect(result).toBe(0);
  });

  it('should return second operator index if it index < first operator index', () => {
    const result = findFirstOperatorIndex('-', '+', ['+', '-', '+']);
    expect(result).toBe(0);
  });

  it('should return first operator index if it index < second operator index and array has other operators', () => {
    const result = findFirstOperatorIndex('-', '+', ['*', '/', '+', '^', '-', '+', '*']);
    expect(result).toBe(2);
  });
});

export {};
