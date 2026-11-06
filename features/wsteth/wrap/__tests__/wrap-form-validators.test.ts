import { describe, expect, it } from 'vitest';
import { parseEther } from 'viem';

import { TOKENS_TO_WRAP } from 'features/wsteth/shared/types';
import { LIMIT_LEVEL } from 'types/limit';

import { WrapFormValidationResolver } from '../wrap-form-context/wrap-form-validators';
import type {
  WrapFormAsyncValidationContext,
  WrapFormInputType,
} from '../wrap-form-context/types';

const asyncContext: WrapFormAsyncValidationContext = {
  stakingLimitLevel: LIMIT_LEVEL.SAFE,
  currentStakeLimit: parseEther('1000'),
  shouldValidateEtherBalance: true,
  gasCost: parseEther('0.001'),
  isWalletActive: true,
  stethBalance: parseEther('10'),
  etherBalance: parseEther('10'),
  isSmartAccount: false,
};

const resolve = (values: WrapFormInputType, context = asyncContext) =>
  WrapFormValidationResolver(
    values,
    { asyncContext: Promise.resolve(context) },
    { fields: {}, shouldUseNativeValidation: false },
  );

describe('WrapFormValidationResolver', () => {
  it('returns the values it validated', async () => {
    const values: WrapFormInputType = {
      amount: parseEther('1'),
      token: TOKENS_TO_WRAP.stETH,
      referral: null,
    };

    const result = await resolve(values);

    expect(result.errors).toEqual({});
    expect(result.values).toEqual(values);
  });

  // hook-form hands the resolver its live values object and submits whatever
  // the resolver returns: a token switched during the await must not ride
  // along with an amount validated for the other token
  it('does not let a token changed mid-validation into the result', async () => {
    const liveValues: WrapFormInputType = {
      amount: parseEther('1'),
      token: TOKENS_TO_WRAP.stETH,
      referral: null,
    };

    const pending = resolve(liveValues);
    liveValues.token = TOKENS_TO_WRAP.ETH;
    const result = await pending;

    expect(result.errors).toEqual({});
    expect((result.values as WrapFormInputType).token).toBe(
      TOKENS_TO_WRAP.stETH,
    );
  });

  it('rejects a stETH amount above the balance', async () => {
    const result = await resolve({
      amount: parseEther('11'),
      token: TOKENS_TO_WRAP.stETH,
      referral: null,
    });

    expect(Object.keys(result.errors)).toContain('amount');
  });
});
