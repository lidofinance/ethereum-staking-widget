import { getFirstTokenInOnChain, isStakeTokenIn } from './token-in';

const list = [
  { token: 'weth', chainId: 10 },
  { token: 'eth', chainId: 10 },
  { token: 'eth', chainId: 1 },
  { token: 'steth', chainId: 8453 },
];

describe('isStakeTokenIn', () => {
  it('accepts ETH and WETH only', () => {
    expect(isStakeTokenIn('eth')).toBe(true);
    expect(isStakeTokenIn('weth')).toBe(true);
    expect(isStakeTokenIn('steth')).toBe(false);
  });
});

describe('getFirstTokenInOnChain', () => {
  it('takes the first stake-in token of the chain, in list order', () => {
    expect(getFirstTokenInOnChain(list, 10)).toEqual({
      token: 'weth',
      chainId: 10,
    });
  });

  it('skips tokens that cannot be staked', () => {
    expect(getFirstTokenInOnChain(list, 8453)).toBeUndefined();
  });

  it('is undefined for a chain the list does not have', () => {
    expect(getFirstTokenInOnChain(list, 42161)).toBeUndefined();
  });
});
