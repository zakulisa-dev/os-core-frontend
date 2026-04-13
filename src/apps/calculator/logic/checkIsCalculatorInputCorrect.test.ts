import { checkIsCalculatorInputCorrect } from './checkIsCalculatorInputCorrect';

describe('checkIsCalculatorInputCorrect', () => {
  it('should return false if input has letters', () => {
    const result = checkIsCalculatorInputCorrect('1+a');
    expect(result).toBe(false);
  });

  it('should return false if input has pluses in a row', () => {
    const result = checkIsCalculatorInputCorrect('1++1');
    expect(result).toBe(false);
  });

  it('should return false if input has multiply in a row', () => {
    const result = checkIsCalculatorInputCorrect('1**1');
    expect(result).toBe(false);
  });

  it('should return false if input has division in a row', () => {
    const result = checkIsCalculatorInputCorrect('1//1');
    expect(result).toBe(false);
  });

  it('should return false if input has pows in a row', () => {
    const result = checkIsCalculatorInputCorrect('1^^1');
    expect(result).toBe(false);
  });

  it('should return true if input has 2 minuses in a row', () => {
    const result = checkIsCalculatorInputCorrect('1--1');
    expect(result).toBe(true);
  });

  it('should return false if input has more that 2 minuses in a row', () => {
    const result = checkIsCalculatorInputCorrect('1---1');
    expect(result).toBe(false);
  });

  it('should return false if input first symbol is plus', () => {
    const result = checkIsCalculatorInputCorrect('+1+2');
    expect(result).toBe(false);
  });

  it('should return false if input first symbol is multiply', () => {
    const result = checkIsCalculatorInputCorrect('*1+2');
    expect(result).toBe(false);
  });

  it('should return false if input first symbol is division', () => {
    const result = checkIsCalculatorInputCorrect('/1+2');
    expect(result).toBe(false);
  });

  it('should return false if input first symbol is pow', () => {
    const result = checkIsCalculatorInputCorrect('^1+2');
    expect(result).toBe(false);
  });

  it('should return true if input first symbol is minus', () => {
    const result = checkIsCalculatorInputCorrect('-1+2');
    expect(result).toBe(true);
  });

  it('should return false if input first and second symbols is minuses', () => {
    const result = checkIsCalculatorInputCorrect('--1+2');
    expect(result).toBe(false);
  });

  it('should return true if input has only int numbers and operatos', () => {
    const result = checkIsCalculatorInputCorrect('1+3-5*3/2^1');
    expect(result).toBe(true);
  });

  it('should return true if input has int, float numbers and operatos', () => {
    const result = checkIsCalculatorInputCorrect('1+3.3-5.3*3.2/2^1');
    expect(result).toBe(true);
  });

  it('should return false if input has incorrect symbols', () => {
    const result = checkIsCalculatorInputCorrect('1+&2');
    const result2 = checkIsCalculatorInputCorrect('1+2;');
    const result3 = checkIsCalculatorInputCorrect('1?2');
    const result4 = checkIsCalculatorInputCorrect('1_2');
    const result5 = checkIsCalculatorInputCorrect('1}2');
    expect(result).toBe(false);
    expect(result2).toBe(false);
    expect(result3).toBe(false);
    expect(result4).toBe(false);
    expect(result5).toBe(false);
  });

  it('should return false if input has not numbers', () => {
    const result = checkIsCalculatorInputCorrect('-');
    expect(result).toBe(false);
  });
});
