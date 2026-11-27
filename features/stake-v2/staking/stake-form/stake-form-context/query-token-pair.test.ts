import { resolveQueryTokenPair } from './query-token-pair';

const MAINNET = 1;
const OPTIMISM = 10;

const args = {
  current: {
    tokenIn: { token: 'eth' as const, chainId: MAINNET },
    tokenOut: { token: 'steth' as const, chainId: MAINNET },
  },
  chainIds: [MAINNET, OPTIMISM],
  tokensIn: [
    { token: 'eth', chainId: MAINNET },
    { token: 'weth', chainId: MAINNET },
    { token: 'weth', chainId: OPTIMISM },
    { token: 'eth', chainId: OPTIMISM },
  ],
  tokensOut: [
    { token: 'steth' as const, chainId: MAINNET },
    { token: 'wsteth' as const, chainId: MAINNET },
    { token: 'wsteth' as const, chainId: OPTIMISM },
  ],
};

describe('resolveQueryTokenPair', () => {
  it('applies a valid link as is', () => {
    expect(
      resolveQueryTokenPair(
        { chain: '1', tokenIn: 'WETH', tokenOut: 'wsteth' },
        args,
      ),
    ).toEqual({
      tokenIn: { token: 'weth', chainId: MAINNET },
      tokenOut: { token: 'wsteth', chainId: MAINNET },
    });
  });

  it('an unsupported chain drops to the first supported one', () => {
    expect(
      resolveQueryTokenPair({ chain: '8453', tokenIn: 'weth' }, args).tokenIn,
    ).toEqual({ token: 'weth', chainId: MAINNET });
    expect(resolveQueryTokenPair({ chain: 'nope' }, args).tokenIn.chainId).toBe(
      MAINNET,
    );
  });

  it('a tokenIn not on the chain drops to its first token', () => {
    expect(
      resolveQueryTokenPair({ chain: '10', tokenIn: 'steth' }, args).tokenIn,
    ).toEqual({ token: 'weth', chainId: OPTIMISM });
  });

  it('keeps the current token on the new chain when no tokenIn is given', () => {
    expect(resolveQueryTokenPair({ chain: '10' }, args).tokenIn).toEqual({
      token: 'eth',
      chainId: OPTIMISM,
    });
  });

  it('an invalid tokenOut drops to the first option', () => {
    expect(
      resolveQueryTokenPair({ chain: '10', tokenOut: 'steth' }, args).tokenOut,
    ).toEqual({ token: 'wsteth', chainId: OPTIMISM });
  });

  it('without a chain, the current chain stays', () => {
    expect(resolveQueryTokenPair({ tokenIn: 'weth' }, args)).toEqual({
      tokenIn: { token: 'weth', chainId: MAINNET },
      tokenOut: { token: 'steth', chainId: MAINNET },
    });
  });
});
