import { isWethBalanceReady } from '../validation-context-by-token';

describe('isWethBalanceReady', () => {
  it('waits for the WETH balance of a connected wallet on a chain with WETH', () => {
    expect(
      isWethBalanceReady({
        isDappActive: true,
        isWethSupported: true,
        wethBalance: undefined,
      }),
    ).toBe(false);
    expect(
      isWethBalanceReady({
        isDappActive: true,
        isWethSupported: true,
        wethBalance: 0n,
      }),
    ).toBe(true);
  });

  it('does not wait where there is nothing to read', () => {
    expect(
      isWethBalanceReady({
        isDappActive: false,
        isWethSupported: true,
        wethBalance: undefined,
      }),
    ).toBe(true);
    expect(
      isWethBalanceReady({
        isDappActive: true,
        isWethSupported: false,
        wethBalance: undefined,
      }),
    ).toBe(true);
  });
});
