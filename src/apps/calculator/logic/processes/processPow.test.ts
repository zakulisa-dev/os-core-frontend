import { processPow } from '@Calculator/logic/processes/processPow';

describe('calculator processPow', () => {
  it('should return operators and numbers without changes if operators has not pow', () => {
    const result = processPow([1, 3, 5], ['+', '/']);
    expect(result).toEqual([
      [1, 3, 5],
      ['+', '/'],
    ]);
  });

  it('should process only pow if operators has one pow and other operators', () => {
    const result = processPow([1, 3, 5, 2], ['+', '/', '^']);
    expect(result).toEqual([
      [1, 3, 25],
      ['+', '/'],
    ]);
  });

  it('should process only pow if operators has one pow and has not other operators', () => {
    const result = processPow([1, 3], ['^']);
    expect(result).toEqual([[1], []]);
  });

  it('should process only pows if operators has more that one pow and other operators', () => {
    const result = processPow([1, 3, 5, 2], ['^', '/', '^']);
    expect(result).toEqual([[1, 25], ['/']]);
  });

  it('should process only pows if operators has more that one pow and has not other operators', () => {
    const result = processPow([2, 2, 3], ['^', '^']);
    expect(result).toEqual([[256], []]);
  });
});

export {};
