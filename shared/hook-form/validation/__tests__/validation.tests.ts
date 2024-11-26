/* eslint-disable unicorn/consistent-function-scoping */
import { maxUint256 } from 'viem';
import { TOKENS_TO_WRAP } from 'features/wsteth/shared/types';

import { validateBigintMax } from '../validate-bigint-max';
import { validateBigintMin } from '../validate-bigint-min';
import { validateEtherAmount } from '../validate-ether-amount';
import { DefaultValidationErrorTypes } from '../validation-error';

const message = 'test_message';
const field = 'test_field';

describe('validateBigintMax', () => {
  it('should work', () => {
    validateBigintMax(field, 10n, 12n, message);
    validateBigintMax(field, 12n, 12n, message);
  });

  it('should throw right error', () => {
    const fn = () => validateBigintMax(field, 12n, 10n, message);
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

describe('validateBigintMin', () => {
  it('should work', () => {
    validateBigintMin(field, 12n, 10n, message);
    validateBigintMin(field, 12n, 12n, message);
  });

  it('should throw right error', () => {
    const fn = () => validateBigintMin(field, 10n, 12n, message);
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
    validateEtherAmount(field, 12n, TOKENS_TO_WRAP.stETH);
  });

  it('should throw right error on null amount', () => {
    const fn = () =>
      validateEtherAmount(field, undefined, TOKENS_TO_WRAP.stETH);
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

  it('should throw right error on zero', () => {
    const fn = () => validateEtherAmount(field, 0n, TOKENS_TO_WRAP.stETH);
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
      validateEtherAmount(field, maxUint256 + 1n, TOKENS_TO_WRAP.stETH);
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
