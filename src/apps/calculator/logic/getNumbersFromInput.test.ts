import { getNumbersFromInput } from '@Calculator/logic/getNumbersFromInput';

describe('calculator getNumbersFromInput', () => {
  it('should correct find numbers if input has 1 negative number', () => {
    const result = getNumbersFromInput('-1');
    expect(result).toEqual([-1]);
  });

  it('should correct find numbers if input has 1 positive number', () => {
    const result = getNumbersFromInput('1');
    expect(result).toEqual([1]);
  });

  it('should correct find numbers if input has float number', () => {
    const result = getNumbersFromInput('-1+2.2-3.3');
    expect(result).toEqual([-1, 2.2, 3.3]);
  });

  it('should correct find numbers if input has 2 minus in a row', () => {
    const result = getNumbersFromInput('1--2');
    expect(result).toEqual([1, -2]);
  });

  it('should correct find numbers if input has float number and two minuses in a row', () => {
    const result = getNumbersFromInput('-1+2.2--3.3');
    expect(result).toEqual([-1, 2.2, -3.3]);
  });
});

export {};
