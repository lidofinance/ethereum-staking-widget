/* eslint-disable unicorn/consistent-function-scoping */
import { BigNumber } from 'ethers';
import { MaxUint256 } from '@ethersproject/constants';
import { TOKENS } from '@lido-sdk/constants';
import { validateBignumberMax } from '../validate-bignumber-max';
import { validateBignumberMin } from '../validate-bignumber-min';
import { validateEtherAmount } from '../validate-ether-amount';

import { DefaultValidationErrorTypes } from '../validation-error';

const bn = (v: any) => BigNumber.from(v);
const message = 'test_message';
const field = 'test_field';

describe('validateBignumberMax', () => {
  it('should work', () => {
    validateBignumberMax(field, bn(10), bn(12), message);
    validateBignumberMax(field, bn(12), bn(12), message);
  });

  it('should throw right error', () => {
    const fn = () => validateBignumberMax(field, bn(12), bn(10), message);
    // NB: instanceof is broken in jest runtime
    expect(fn).toThrowError();
    try {
      fn();
    } catch (e) {
      expect(e).toMatchObject({
        field,
        message,
        type: DefaultValidationErrorTypes.VALIDATE,
      });
    }
  });
});

describe('validateBignumberMin', () => {
  it('should work', () => {
    validateBignumberMin(field, bn(12), bn(10), message);
    validateBignumberMin(field, bn(12), bn(12), message);
  });

  it('should throw right error', () => {
    const fn = () => validateBignumberMin(field, bn(10), bn(12), message);
    expect(fn).toThrowError();
    try {
      fn();
    } catch (e) {
      expect(e).toMatchObject({
        field,
        message,
        type: DefaultValidationErrorTypes.VALIDATE,
      });
    }
  });
});

describe('validateEtherAmount', () => {
  it('should work', () => {
    validateEtherAmount(field, bn(12), TOKENS.STETH);
  });

  it('should throw right error on null amount', () => {
    const fn = () => validateEtherAmount(field, null, TOKENS.STETH);
    expect(fn).toThrowError();
    try {
      fn();
    } catch (e) {
      expect(e).toMatchObject({
        field,
        type: DefaultValidationErrorTypes.VALIDATE,
      });
    }
  });

  it('should throw right error on zero ', () => {
    const fn = () => validateEtherAmount(field, bn(0), TOKENS.STETH);
    expect(fn).toThrowError();
    try {
      fn();
    } catch (e) {
      expect(e).toMatchObject({
        field,
        type: DefaultValidationErrorTypes.VALIDATE,
      });
    }
  });

  it('should throw right error on more than ethereum max uint', () => {
    const fn = () =>
      validateEtherAmount(field, MaxUint256.add(1), TOKENS.STETH);
    expect(fn).toThrowError();
    try {
      fn();
    } catch (e) {
      expect(e).toMatchObject({
        field,
        type: DefaultValidationErrorTypes.VALIDATE,
      });
    }
  });
});
