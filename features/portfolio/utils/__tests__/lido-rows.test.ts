import { parseEther } from 'viem';

import type { PortfolioRow } from '../../types';
import {
  getMainnetAddress,
  toOnChainRow,
  withRewards,
  type RewardsByAddress,
} from '../lido-rows';

const STETH = '0xae7ab96520de3a18e5e111b5eaab095312d7fe84';

const rewards = {
  address: STETH,
  rewardsUsd: 7.5,
  rewardsAmount: 0.00275,
  rewardsSymbol: 'stETH',
};

describe('getMainnetAddress', () => {
  it('gives the lowercase Ethereum address of a token', () => {
    expect(getMainnetAddress('steth')).toBe(STETH);
  });

  it('never has capitals, whatever the token', () => {
    for (const token of ['wsteth', 'earneth', 'earnusd'] as const) {
      const address = getMainnetAddress(token);
      expect(address).toMatch(/^0x[0-9a-f]{40}$/);
    }
  });
});

describe('withRewards', () => {
  const row = { key: 'steth', rewardsUsd: 1 } as PortfolioRow;

  it('puts the rewards on the row', () => {
    expect(withRewards(row, rewards)).toMatchObject({
      key: 'steth',
      rewardsUsd: 7.5,
      rewardsAmount: 0.00275,
      rewardsSymbol: 'stETH',
    });
  });

  it('clears them when none are known', () => {
    expect(withRewards(row, undefined)).toMatchObject({
      rewardsUsd: null,
      rewardsAmount: null,
      rewardsSymbol: null,
    });
  });
});

describe('toOnChainRow', () => {
  const byAddress: RewardsByAddress = new Map([[STETH, rewards]]);

  it('builds an Ethereum row with the design name and the token rewards', () => {
    const row = toOnChainRow(
      {
        token: 'steth',
        amount: parseEther('1.5'),
        valueUsd: 3000,
        apr: 2.6,
      },
      byAddress,
    );
    expect(row).toMatchObject({
      key: 'steth',
      symbol: 'stETH',
      name: 'Lido Staked ETH',
      iconToken: 'steth',
      amount: parseEther('1.5'),
      decimals: 18,
      valueUsd: 3000,
      apr: 2.6,
      rewardsUsd: 7.5,
    });
    expect(row.chains).toEqual([
      {
        slug: 'ethereum',
        name: 'Ethereum',
        address: STETH,
        isNative: false,
        amount: parseEther('1.5'),
        decimals: 18,
        amountFloat: null,
        valueUsd: 3000,
      },
    ]);
  });

  it('keeps unknown values as null and finds no foreign rewards', () => {
    const row = toOnChainRow(
      {
        token: 'wsteth',
        amount: undefined,
        valueUsd: undefined,
        apr: undefined,
      },
      byAddress,
    );
    expect(row).toMatchObject({
      amount: null,
      valueUsd: null,
      apr: null,
      rewardsUsd: null,
      name: 'Lido wrapped Staked ETH',
    });
  });
});
