import { findMaxDecimalLength } from './findMaxDecimalLength';

describe('calculator findMaxDecimalLength', () => {
  it('should correct find max decimal length for int and decimal', () => {
    const result = findMaxDecimalLength(1, 1.23);
    expect(result).toBe(2);
  });

  it('should correct find max decimal length for decimals', () => {
    const result = findMaxDecimalLength(23.321, 13213.23);
    expect(result).toBe(3);
  });
});

export {};
