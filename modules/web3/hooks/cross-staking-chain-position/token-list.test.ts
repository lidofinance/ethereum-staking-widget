import { zeroAddress } from 'viem';

import type { PositionToken } from './conversion';
import {
  filterPositionByTokenList,
  getPositionSlots,
  isInTokenList,
  type PositionTokenList,
} from './token-list';
import type {
  CrossStakingChainPosition,
  CrossStakingChainPositionToken,
} from './use-cross-chain-balances';

const MAINNET = 1;
// L2 with stETH
const OPTIMISM = 10;
// L2 without stETH
const ARBITRUM = 42161;

const token = (
  name: PositionToken,
  ethValue?: bigint,
  chainId = MAINNET,
): CrossStakingChainPositionToken => ({
  token: name,
  tokenLabel: name as CrossStakingChainPositionToken['tokenLabel'],
  chainId,
  tokenAddress: zeroAddress,
  balance: ethValue ?? 1n,
  ethValue,
});

const position: CrossStakingChainPosition = {
  tokens: [
    token('eth', 1n),
    token('weth', 2n),
    token('steth', 4n),
    token('wsteth', undefined),
  ],
  totalEthValue: 7n,
  totalUsdValue: 70,
};

const ethToUsd = (ethAmount: bigint) => Number(ethAmount) * 10;

const names = ({ tokens }: CrossStakingChainPosition) =>
  tokens.map(({ token }) => token);

const listed = (tokenList: PositionTokenList, chainIds: number[]) =>
  getPositionSlots(chainIds)
    .filter((slot) => isInTokenList(tokenList, slot))
    .map(({ token, chainId }) => `${chainId}:${token}`);

describe('filterPositionByTokenList', () => {
  it('all: returns an L1-only position as is', () => {
    expect(
      filterPositionByTokenList({ position, tokenList: 'all', ethToUsd }),
    ).toBe(position);
  });

  it('stakable: keeps ETH and WETH and sums only them', () => {
    const result = filterPositionByTokenList({
      position,
      tokenList: 'stakable',
      ethToUsd,
    });
    expect(names(result)).toEqual(['eth', 'weth']);
    expect(result.totalEthValue).toBe(3n);
    expect(result.totalUsdValue).toBe(30);
  });

  it('staked: keeps stETH and wstETH, a missing ethValue adds nothing', () => {
    const result = filterPositionByTokenList({
      position,
      tokenList: 'staked',
      ethToUsd,
    });
    expect(names(result)).toEqual(['steth', 'wsteth']);
    expect(result.totalEthValue).toBe(4n);
    expect(result.totalUsdValue).toBe(40);
  });

  it('staked: drops L2 stETH from the tokens and the totals', () => {
    const result = filterPositionByTokenList({
      position: {
        tokens: [token('steth', 4n), token('steth', 8n, OPTIMISM)],
        totalEthValue: 12n,
        totalUsdValue: 120,
      },
      tokenList: 'staked',
      ethToUsd,
    });
    expect(result.tokens.map(({ chainId }) => chainId)).toEqual([MAINNET]);
    expect(result.totalEthValue).toBe(4n);
  });
});

describe('getPositionSlots', () => {
  it('follows chain order, then ETH -> WETH -> stETH -> wstETH', () => {
    expect(listed('all', [OPTIMISM, MAINNET])).toEqual([
      '10:eth',
      '10:weth',
      '10:wsteth',
      '1:eth',
      '1:weth',
      '1:steth',
      '1:wsteth',
    ]);
  });
});

describe('isInTokenList', () => {
  const chains = [MAINNET, OPTIMISM, ARBITRUM];

  it('stakable: ETH and WETH on every chain', () => {
    expect(listed('stakable', chains)).toEqual([
      '1:eth',
      '1:weth',
      '10:eth',
      '10:weth',
      '42161:eth',
      '42161:weth',
    ]);
  });

  it('staked: wstETH everywhere, stETH on L1 only', () => {
    expect(listed('staked', chains)).toEqual([
      '1:steth',
      '1:wsteth',
      '10:wsteth',
      '42161:wsteth',
    ]);
  });

  it('wrappable: all of L1, stETH and wstETH of L2s with stETH', () => {
    expect(listed('wrappable', chains)).toEqual([
      '1:eth',
      '1:weth',
      '1:steth',
      '1:wsteth',
      '10:steth',
      '10:wsteth',
    ]);
  });
});
