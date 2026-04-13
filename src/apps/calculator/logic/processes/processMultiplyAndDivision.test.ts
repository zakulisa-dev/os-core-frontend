import { processMultiplyAndDivision } from './processMultiplyAndDivision';

describe('calculator processMultiplyAndDivision', () => {
  it('should process multiply and int', () => {
    const result = processMultiplyAndDivision([11, 2, 3], ['*', '*']);
    expect(result).toEqual([[66], []]);
  });

  it('should process division and int', () => {
    const result = processMultiplyAndDivision([12, 2, 4], ['/', '/']);
    expect(result).toEqual([[1.5], []]);
  });

  it('should process multiply, division and int', () => {
    const result = processMultiplyAndDivision([12, -2, 3], ['*', '/']);
    expect(result).toEqual([[-8], []]);
  });

  it('should process multiply and float', () => {
    const result = processMultiplyAndDivision([1.11, -2.2], ['*']);
    expect(result).toEqual([[-2.442], []]);
  });

  it('should process division and float', () => {
    const result = processMultiplyAndDivision([-2.442, 2.2], ['/']);
    expect(result).toEqual([[-1.11], []]);
  });

  it('should process multiply, division and float', () => {
    const result = processMultiplyAndDivision([1, 2, 1.1], ['*', '*']);
    expect(result).toEqual([[2.2], []]);
  });

  it('should process division, int and float', () => {
    const result = processMultiplyAndDivision([-6, 1.2, 2], ['/', '/']);
    expect(result).toEqual([[-2.5], []]);
  });

  it('should process multiply, division, int and float', () => {
    const result = processMultiplyAndDivision([-6, 1.2, 1.1111], ['/', '*']);
    expect(result).toEqual([[-5.5555], []]);
  });
});

export {};
