import { TOKENS_TO_WITHDRAWLS } from 'features/withdrawals/types/tokens-withdrawable';

import {
  RequestFormValidationResolver,
  TvlErrorPayload,
  __test__export,
} from '../validators';
import type {
  RequestFormInputType,
  RequestFormValidationAsyncContextType,
} from '../types';

const {
  ValidationSplitRequest,
  ValidationTvlJoke,
  tvlJokeValidate,
  validateSplitRequests,
} = __test__export;

const field = 'test_field';
const balance = 5n;

const getThrownError = (fn: () => void): unknown => {
  try {
    fn();
  } catch (error) {
    return error;
  }

  throw new Error('Expected function to throw');
};

describe('tvlJokeValidate', () => {
  it('should work', () => {
    expect(() => tvlJokeValidate(field, 10n, 12n, balance)).not.toThrow();
  });

  it('should throw right error', () => {
    const value = 20n;
    const tvl = 10n;
    const fn = () => tvlJokeValidate(field, value, tvl, balance);
    const error = getThrownError(fn);

    expect(error).toMatchObject({
      field,
      type: ValidationTvlJoke.type,
    });
    expect(error).toHaveProperty('payload.balanceDiffSteth');
    expect(
      value - balance ===
        (error as { payload: TvlErrorPayload }).payload.balanceDiffSteth,
    ).toBe(true);

    expect(error).toHaveProperty('payload.tvlDiff');
    expect(
      value - tvl === (error as { payload: TvlErrorPayload }).payload.tvlDiff,
    ).toBe(true);
  });
});

const maxAmountPerRequest = 100n;
const minAmountPerRequest = 10n;
const maxRequestCount = 100;

describe('validateSplitRequests', () => {
  it('should split into 1 request', () => {
    const requests = validateSplitRequests(
      field,
      10n,
      maxAmountPerRequest,
      minAmountPerRequest,
      maxRequestCount,
    );
    expect(requests).toHaveLength(1);
    expect(requests[0] === 10n).toBe(true);
  });

  it('should split into 2 requests', () => {
    const amount = maxAmountPerRequest + minAmountPerRequest * 5n;
    const requests = validateSplitRequests(
      field,
      amount,
      maxAmountPerRequest,
      minAmountPerRequest,
      maxRequestCount,
    );
    expect(requests).toHaveLength(2);
    expect(requests[0] === maxAmountPerRequest).toBe(true);
    expect(requests[1] === amount - maxAmountPerRequest).toBe(true);
  });

  it('should split into 2(max+min) requests', () => {
    const requests = validateSplitRequests(
      field,
      maxAmountPerRequest + minAmountPerRequest,
      maxAmountPerRequest,
      minAmountPerRequest,
      maxRequestCount,
    );
    expect(requests).toHaveLength(2);
    expect(requests[0] === maxAmountPerRequest).toBe(true);
    expect(requests[1] === minAmountPerRequest).toBe(true);
  });

  it('should split into max requests', () => {
    const requests = validateSplitRequests(
      field,
      maxAmountPerRequest * BigInt(maxRequestCount),
      maxAmountPerRequest,
      minAmountPerRequest,
      maxRequestCount,
    );
    expect(requests).toHaveLength(maxRequestCount);
    requests.forEach((r) => {
      expect(r === maxAmountPerRequest).toBe(true);
    });
  });

  it('should throw right error when more than max', () => {
    const fn = () =>
      validateSplitRequests(
        field,
        maxAmountPerRequest * BigInt(maxRequestCount) + 1n,
        maxAmountPerRequest,
        minAmountPerRequest,
        maxRequestCount,
      );
    const error = getThrownError(fn);

    expect(error).toMatchObject({
      field,
      type: ValidationSplitRequest.type,
    });
    expect(error).toHaveProperty('payload.requestCount');
    expect((error as any).payload.requestCount).toBe(maxRequestCount + 1);
  });

  it('should throw right error when cannot split because of left over', () => {
    const fn = () =>
      validateSplitRequests(
        field,
        maxAmountPerRequest + minAmountPerRequest - 1n,
        maxAmountPerRequest,
        minAmountPerRequest,
        maxRequestCount,
      );
    const error = getThrownError(fn);

    expect(error).toMatchObject({
      field,
      type: ValidationSplitRequest.type,
    });
  });
});

describe('RequestFormValidationResolver', () => {
  const asyncContext: RequestFormValidationAsyncContextType = {
    minUnstakeSteth: 100n,
    minUnstakeWSteth: 100n,
    balanceSteth: 1_000_000n,
    balanceWSteth: 1_000_000n,
    maxAmountPerRequestSteth: 1_000n,
    maxAmountPerRequestWSteth: 1_000n,
    stethTotalSupply: 10_000_000n,
    maxRequestCount: 256,
  };

  const resolve = (values: RequestFormInputType) =>
    RequestFormValidationResolver(
      values,
      {
        isWalletActive: true,
        asyncContext: Promise.resolve(asyncContext),
        setIntermediateValidationResults: () => undefined,
      },
      { fields: {}, shouldUseNativeValidation: false },
    );

  it('splits the requests from the amount it returns', async () => {
    const result = await resolve({
      amount: 2_500n,
      token: TOKENS_TO_WITHDRAWLS.stETH,
      mode: 'lido',
      requests: null,
    });

    expect(result.errors).toEqual({});
    const values = result.values as RequestFormInputType;
    expect(values.amount).toBe(2_500n);
    expect(values.requests).toEqual([1_000n, 1_000n, 500n]);
  });

  // hook-form hands the resolver its live values object and submits whatever
  // the resolver returns: an amount edited during the await must not pair
  // with requests split from the earlier amount
  it('does not let an amount edited mid-validation into the result', async () => {
    const liveValues: RequestFormInputType = {
      amount: 2_500n,
      token: TOKENS_TO_WITHDRAWLS.stETH,
      mode: 'lido',
      requests: null,
    };

    const pending = resolve(liveValues);
    liveValues.amount = 500n;
    const result = await pending;

    expect(result.errors).toEqual({});
    const values = result.values as RequestFormInputType;
    expect(values.amount).toBe(2_500n);
    expect(values.requests).toEqual([1_000n, 1_000n, 500n]);
  });
});
