function findMaxDecimalLength(a: number, b: number): number {
  return Math.max(a.toString().split('.')[1]?.length || 0, b.toString().split('.')[1]?.length || 0);
}

export { findMaxDecimalLength };
