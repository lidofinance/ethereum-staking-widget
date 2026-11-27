import { resolveStakeRoute } from './registry';

const MAINNET = 1;
// L2 with fast stake
const OPTIMISM = 10;

const routeOf = (
  tokenIn: string,
  tokenOut: string,
  chainIn: number,
  chainOut = chainIn,
) =>
  resolveStakeRoute({
    tokenIn: { token: tokenIn, chainId: chainIn },
    tokenOut: { token: tokenOut, chainId: chainOut },
  })?.id ?? null;

describe('resolveStakeRoute', () => {
  it('L1: ETH and WETH stake into stETH', () => {
    expect(routeOf('eth', 'steth', MAINNET)).toBe('stake');
    expect(routeOf('weth', 'steth', MAINNET)).toBe('stake');
  });

  it('L1: ETH and WETH (unwrapped first) wrap straight into wstETH', () => {
    expect(routeOf('eth', 'wsteth', MAINNET)).toBe('wrap-eth');
    expect(routeOf('weth', 'wsteth', MAINNET)).toBe('wrap-eth');
  });

  it('L2: ETH and WETH fast stake into wstETH', () => {
    expect(routeOf('eth', 'wsteth', OPTIMISM)).toBe('fast-stake');
    expect(routeOf('weth', 'wsteth', OPTIMISM)).toBe('fast-stake');
    expect(routeOf('eth', 'steth', OPTIMISM)).toBeNull();
  });

  it('no route across chains yet', () => {
    expect(routeOf('eth', 'wsteth', MAINNET, OPTIMISM)).toBeNull();
  });
});
