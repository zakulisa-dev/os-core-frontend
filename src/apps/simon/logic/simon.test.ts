import { generatePattern, regeneratePattern, updatePattern } from '.';

describe('logic/simon', () => {
  it('should generate random numbers then calls generatePattern', () => {
    const result = generatePattern(10);

    expect(result).toHaveLength(3);
    expect(Math.max(...result)).toBeLessThanOrEqual(10);
  });

  it('should update pattern then calls updatePattern', () => {
    const result = updatePattern([1, 3, 4, 2], 4);

    expect(result).toHaveLength(5);
    expect(Math.max(...result)).toBeLessThanOrEqual(4);
  });

  it('should regenerate random numbers then calls regeneratePattern', () => {
    const result = regeneratePattern(6, 10);

    expect(result).toHaveLength(6);
    expect(Math.max(...result)).toBeLessThanOrEqual(10);
  });
});
