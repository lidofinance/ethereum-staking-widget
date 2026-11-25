import { describe, it, expect } from 'vitest';

import { createTokenPairTracker, getTokenPair } from '../token-pair-tracker';

const ETH = {
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  symbol: 'ETH',
};
const WETH = {
  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  symbol: 'WETH',
};
const STETH = {
  address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
  symbol: 'stETH',
};

describe('getTokenPair', () => {
  it('joins sell and buy symbols', () => {
    expect(getTokenPair(ETH, STETH)).toBe('ETH-stETH');
  });

  it('is undefined without both symbols', () => {
    expect(getTokenPair(ETH, undefined)).toBeUndefined();
    expect(getTokenPair({ address: ETH.address }, STETH)).toBeUndefined();
  });
});

describe('createTokenPairTracker', () => {
  it('keeps the posted pair for the order lifecycle events', () => {
    const tracker = createTokenPairTracker();
    // an EthFlow order sells WETH on chain, the posted event names ETH
    expect(tracker.postedOrder('uid-1', ETH, STETH)).toBe('ETH-stETH');
    expect(
      tracker.order({
        uid: 'uid-1',
        sellToken: WETH.address,
        buyToken: STETH.address,
      }),
    ).toBe('ETH-stETH');
  });

  it('resolves an unknown order by the symbols seen before, in any case', () => {
    const tracker = createTokenPairTracker();
    tracker.pair(WETH, STETH);
    expect(
      tracker.order({
        uid: 'uid-2',
        sellToken: STETH.address.toLowerCase(),
        buyToken: WETH.address.toUpperCase().replace('0X', '0x'),
      }),
    ).toBe('stETH-WETH');
  });

  it('is undefined for tokens it has not seen', () => {
    const tracker = createTokenPairTracker();
    expect(
      tracker.order({
        uid: 'uid-3',
        sellToken: WETH.address,
        buyToken: STETH.address,
      }),
    ).toBeUndefined();
  });
});
