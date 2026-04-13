import { processAddAndSubtract } from './processAddAndSubtract';

describe('calculator processAddAndSubstract', () => {
  it('should process add and int', () => {
    const result = processAddAndSubtract([1, 3, 5, 7], ['+', '+', '+']);
    expect(result).toEqual([[16], []]);
  });

  it('should process subtract and int', () => {
    const result = processAddAndSubtract([1, 3, 5, 7], ['-', '-', '-']);
    expect(result).toEqual([[-14], []]);
  });

  it('should process subtract, add and int', () => {
    const result = processAddAndSubtract([1, 3, 5, 7], ['-', '+', '-']);
    expect(result).toEqual([[-4], []]);
  });

  it('should process add and float', () => {
    const result = processAddAndSubtract([1.1, 2.22, 3.3], ['+', '+']);
    expect(result).toEqual([[6.62], []]);
  });

  it('should process subtract and float', () => {
    const result = processAddAndSubtract([-1.12, 3.3], ['-']);
    expect(result).toEqual([[-4.42], []]);
  });

  it('should process add, subtract and float', () => {
    const result = processAddAndSubtract([1.1, 2.22, 3.3], ['+', '-']);
    expect(result).toEqual([[0.02], []]);
  });

  it('should process add, int and float', () => {
    const result = processAddAndSubtract([1.1, 2.22, 3], ['+', '+']);
    expect(result).toEqual([[6.32], []]);
  });

  it('should process subtract, int and float', () => {
    const result = processAddAndSubtract([1.1, 2, 3.3], ['-', '-']);
    expect(result).toEqual([[-4.2], []]);
  });

  it('should process subtract, add, division, int and float', () => {
    const result = processAddAndSubtract([-6, 1.2, 1.1111], ['+', '-']);
    expect(result).toEqual([[-5.9111], []]);
  });
});

export {};
