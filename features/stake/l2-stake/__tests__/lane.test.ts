import { L2_STAKE_LANE, resolveL2StakeLane } from '../lane';

const P = 10n ** 18n;
const LIQUIDITY = 7n * P;

const both = { isFastLaneAvailable: true, isSlowLaneAvailable: true };

describe('resolveL2StakeLane', () => {
  it('swaps on the L2 up to the pool liquidity and sends above it', () => {
    const resolve = (amount: bigint) =>
      resolveL2StakeLane({ amount, fastLaneLiquidity: LIQUIDITY, ...both });
    expect(resolve(1n)).toBe(L2_STAKE_LANE.fast);
    expect(resolve(LIQUIDITY)).toBe(L2_STAKE_LANE.fast);
    expect(resolve(LIQUIDITY + 1n)).toBe(L2_STAKE_LANE.slow);
    expect(resolve(10n ** 30n)).toBe(L2_STAKE_LANE.slow);
  });

  it('stays on the fast lane while the amount or the liquidity is unknown', () => {
    expect(
      resolveL2StakeLane({
        amount: null,
        fastLaneLiquidity: LIQUIDITY,
        ...both,
      }),
    ).toBe(L2_STAKE_LANE.fast);
    expect(
      resolveL2StakeLane({
        amount: 10n ** 30n,
        fastLaneLiquidity: undefined,
        ...both,
      }),
    ).toBe(L2_STAKE_LANE.fast);
  });

  it('keeps every amount on the fast lane while the slow lane is not offered', () => {
    expect(
      resolveL2StakeLane({
        amount: LIQUIDITY + 1n,
        fastLaneLiquidity: LIQUIDITY,
        isFastLaneAvailable: true,
        isSlowLaneAvailable: false,
      }),
    ).toBe(L2_STAKE_LANE.fast);
  });

  it('sends every amount while the fast lane is not offered', () => {
    const resolve = (amount: bigint | null) =>
      resolveL2StakeLane({
        amount,
        fastLaneLiquidity: LIQUIDITY,
        isFastLaneAvailable: false,
        isSlowLaneAvailable: true,
      });
    expect(resolve(1n)).toBe(L2_STAKE_LANE.slow);
    expect(resolve(null)).toBe(L2_STAKE_LANE.slow);
  });

  it('falls back to the fast lane when neither is offered', () => {
    expect(
      resolveL2StakeLane({
        amount: 1n,
        fastLaneLiquidity: LIQUIDITY,
        isFastLaneAvailable: false,
        isSlowLaneAvailable: false,
      }),
    ).toBe(L2_STAKE_LANE.fast);
  });
});
