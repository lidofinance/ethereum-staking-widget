/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-conditional-expect */
import { BigNumber } from 'ethers';
import { TvlErrorPayload, __test__export } from '../validators';
const {
  ValidationSplitRequest,
  ValidationTvlJoke,
  tvlJokeValidate,
  validateSplitRequests,
} = __test__export;

const bn = (v: any) => BigNumber.from(v);
const field = 'test_field';
const balance = bn(5);

describe('tvlJokeValidate', () => {
  it('should work', () => {
    tvlJokeValidate(field, bn(10), bn(12), balance);
  });

  it('should throw right error', () => {
    const value = bn(20);
    const tvl = bn(10);
    const fn = () => tvlJokeValidate(field, value, tvl, balance);
    expect(fn).toThrow();
    try {
      fn();
    } catch (e) {
      expect(e).toMatchObject({
        field,
        type: ValidationTvlJoke.type,
      });
      expect(e).toHaveProperty('payload.balanceDiffSteth');
      expect(
        value
          .sub(balance)
          .eq((e as { payload: TvlErrorPayload }).payload.balanceDiffSteth),
      ).toBe(true);

      expect(e).toHaveProperty('payload.tvlDiff');
      expect(
        value.sub(tvl).eq((e as { payload: TvlErrorPayload }).payload.tvlDiff),
      ).toBe(true);
    }
  });
});

const maxAmountPerRequest = bn(100);
const minAmountPerRequest = bn(10);
const maxRequestCount = 100;
describe('validateSplitRequests', () => {
  it('should split into 1 request', () => {
    const requests = validateSplitRequests(
      field,
      bn(10),
      maxAmountPerRequest,
      minAmountPerRequest,
      maxRequestCount,
    );
    expect(requests).toHaveLength(1);
    expect(requests[0].eq(bn(10))).toBe(true);
  });

  it('should split into 2 requests', () => {
    const amount = maxAmountPerRequest.add(minAmountPerRequest.mul(5));
    const requests = validateSplitRequests(
      field,
      amount,
      maxAmountPerRequest,
      minAmountPerRequest,
      maxRequestCount,
    );
    expect(requests).toHaveLength(2);
    expect(requests[0].eq(maxAmountPerRequest)).toBe(true);
    expect(requests[1].eq(amount.sub(maxAmountPerRequest))).toBe(true);
  });

  it('should split into 2(max+min) requests', () => {
    const requests = validateSplitRequests(
      field,
      maxAmountPerRequest.add(minAmountPerRequest),
      maxAmountPerRequest,
      minAmountPerRequest,
      maxRequestCount,
    );
    expect(requests).toHaveLength(2);
    expect(requests[0].eq(maxAmountPerRequest)).toBe(true);
    expect(requests[1].eq(minAmountPerRequest)).toBe(true);
  });

  it('should split into max requests', () => {
    const requests = validateSplitRequests(
      field,
      maxAmountPerRequest.mul(maxRequestCount),
      maxAmountPerRequest,
      minAmountPerRequest,
      maxRequestCount,
    );
    expect(requests).toHaveLength(maxRequestCount);
    requests.forEach((r) => {
      expect(r.eq(maxAmountPerRequest)).toBe(true);
    });
  });

  it('should throw right error when more than max', () => {
    const fn = () =>
      validateSplitRequests(
        field,
        maxAmountPerRequest.mul(maxRequestCount).add(1),
        maxAmountPerRequest,
        minAmountPerRequest,
        maxRequestCount,
      );
    expect(fn).toThrow();
    try {
      fn();
    } catch (e) {
      expect(e).toMatchObject({
        field,
        type: ValidationSplitRequest.type,
      });
      expect(e).toHaveProperty('payload.requestCount');
      expect((e as any).payload.requestCount).toBe(maxRequestCount + 1);
    }
  });

  it('should throw right error when cannot split because of left over', () => {
    const fn = () =>
      validateSplitRequests(
        field,
        maxAmountPerRequest.add(minAmountPerRequest).sub(1),
        maxAmountPerRequest,
        minAmountPerRequest,
        maxRequestCount,
      );
    expect(fn).toThrow();
    try {
      fn();
    } catch (e) {
      expect(e).toMatchObject({
        field,
        type: ValidationSplitRequest.type,
      });
    }
  });
});
