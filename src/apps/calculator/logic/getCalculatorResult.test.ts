import { getCalcResult } from './getCalculatorResult';

describe('calculatorLogic', () => {
  it('getCalcResult should work correctly if input empty', () => {
    const result = getCalcResult('');

    expect(result).toEqual('Error');
  });

  it('getCalcResult should work correctly if input not correct', () => {
    const result = getCalcResult('1++2');

    expect(result).toEqual('Error');
  });

  it('getCalcResult should work correctly if input has negative number', () => {
    const result = getCalcResult('1+-2');

    expect(result).toEqual('-1');
  });

  it('getCalcResult should work correctly if input has negative numbers', () => {
    const result = getCalcResult('-1+-2');

    expect(result).toEqual('-3');
  });

  it('getCalcResult should work correctly if result nan', () => {
    const result = getCalcResult('0/0');

    expect(result).toEqual('Error');
  });

  it('getCalcResult should work correctly if input only one plus', () => {
    const result = getCalcResult('1+2');

    expect(result).toEqual('3');
  });

  it('getCalcResult should work correctly if input more than one plus', () => {
    const result = getCalcResult('1+2+3');

    expect(result).toEqual('6');
  });

  it('getCalcResult should work correctly if input is only one plus between decimal and integer', () => {
    const result = getCalcResult('1+2.2');

    expect(result).toEqual('3.2');
  });

  it('getCalcResult should work correctly if input is only one plus between decimals', () => {
    const result = getCalcResult('1.1+2.2');

    expect(result).toEqual('3.3');
  });

  it('getCalcResult should work correctly if input is more than one pluses between decimals and integers', () => {
    const result = getCalcResult('1.1+2.2+3+1.2');

    expect(result).toEqual('7.5');
  });

  it('getCalcResult should work correctly if input is more than one pluses between decimals and integers and negative numbers', () => {
    const result = getCalcResult('1.1+2.2+3+-1.2');

    expect(result).toEqual('5.1');
  });

  it('getCalcResult should work correctly if input is only one minus', () => {
    const result = getCalcResult('1-2');

    expect(result).toEqual('-1');
  });

  it('getCalcResult should work correctly if input is more than one minuses', () => {
    const result = getCalcResult('1-2-1');

    expect(result).toEqual('-2');
  });

  it('getCalcResult should work correctly if input is more than one minuses and has negative number', () => {
    const result = getCalcResult('1-2--1');

    expect(result).toEqual('0');
  });

  it('getCalcResult should work correctly if input is only one minus between decimal and integer', () => {
    const result = getCalcResult('1-2.2');

    expect(result).toEqual('-1.2');
  });

  it('getCalcResult should work correctly if input is only one minus between decimals', () => {
    const result = getCalcResult('3.1-2.2');

    expect(result).toEqual('0.9');
  });

  it('getCalcResult should work correctly if input is more than one minuses between decimals and integers', () => {
    const result = getCalcResult('3.1-2.2+3-1.2');

    expect(result).toEqual('2.7');
  });

  it('getCalcResult should work correctly if input is combine plus, minus and integers', () => {
    const result = getCalcResult('3-1+2');

    expect(result).toEqual('4');
  });

  it('getCalcResult should work correctly if input is combine plus, minus and decimals', () => {
    const result = getCalcResult('3.2+1.1-2.1');

    expect(result).toEqual('2.2');
  });

  it('getCalcResult should work correctly if input is combine plus, minus, decimals and integers', () => {
    const result = getCalcResult('3.2+1-2.1');

    expect(result).toEqual('2.1');
  });

  it('getCalcResult should work correctly if input is only one multiple', () => {
    const result = getCalcResult('3*5');

    expect(result).toEqual('15');
  });

  it('getCalcResult should work correctly if input is more than one multiples', () => {
    const result = getCalcResult('3*2*2');

    expect(result).toEqual('12');
  });

  it('getCalcResult should work correctly if input is more than one multiples and negative number', () => {
    const result = getCalcResult('3*2*-2');

    expect(result).toEqual('-12');
  });

  it('getCalcResult should work correctly if input is more than one multiples and negative numbers', () => {
    const result = getCalcResult('-3*2*-2');

    expect(result).toEqual('12');
  });

  it('getCalcResult should work correctly if input is only one multiple between decimal and integer', () => {
    const result = getCalcResult('2*2.2');

    expect(result).toEqual('4.4');
  });

  it('getCalcResult should work correctly if input is only one multiple between decimals', () => {
    const result = getCalcResult('1.1*1.1');

    expect(result).toEqual('1.21');
  });

  it('getCalcResult should work correctly if input is more than one multiples between decimals and integers', () => {
    const result = getCalcResult('2*1.1*1.1');

    expect(result).toEqual('2.42');
  });

  it('getCalcResult should work correctly if input is only one division', () => {
    const result = getCalcResult('6/3');

    expect(result).toEqual('2');
  });

  it('getCalcResult should work correctly if input is more than one divisions', () => {
    const result = getCalcResult('6/2/2');

    expect(result).toEqual('1.5');
  });

  it('getCalcResult should work correctly if input is more than one divisions and has negative number', () => {
    const result = getCalcResult('6/-2/2');

    expect(result).toEqual('-1.5');
  });

  it('getCalcResult should work correctly if input is more than one divisions and has negative numbers', () => {
    const result = getCalcResult('-6/-2/2');

    expect(result).toEqual('1.5');
  });

  it('getCalcResult should work correctly if input is only one division between decimal and integer', () => {
    const result = getCalcResult('6/1.5');

    expect(result).toEqual('4');
  });

  it('getCalcResult should work correctly if input is only one division between decimals', () => {
    const result = getCalcResult('1.21/1.1');

    expect(result).toEqual('1.1');
  });

  it('getCalcResult should work correctly if input is more than one divisions between decimals and integers', () => {
    const result = getCalcResult('6/1.5/2');

    expect(result).toEqual('2');
  });

  it('getCalcResult should work correctly if input is one exponentiation', () => {
    const result = getCalcResult('2^3');

    expect(result).toEqual('8');
  });

  it('getCalcResult should work correctly if input is one negative exponentiation', () => {
    const result = getCalcResult('2^-1');

    expect(result).toEqual('0.5');
  });

  it('getCalcResult should work correctly if input is more than one exponentiation', () => {
    const result = getCalcResult('2^3^2');

    expect(result).toEqual('512');
  });

  it('getCalcResult should work correctly if input is more than one exponentiation and zero', () => {
    const result = getCalcResult('2^3^0');

    expect(result).toEqual('2');
  });

  it('getCalcResult should work correctly if mix of all operators and integers', () => {
    const result = getCalcResult('2+3*2-2^2/4');

    expect(result).toEqual('7');
  });

  it('getCalcResult should work correctly if mix of all operators, decimals and integers', () => {
    const result = getCalcResult('2.2+3-1.1^2/2');

    expect(result).toEqual('4.595');
  });

  it('getCalcResult should work correctly if mix of all operators, decimals, negative numbers and integers', () => {
    const result = getCalcResult('2.2+3-1.1^2/-2');

    expect(result).toEqual('5.805');
  });
});
