import { zeroAddress } from 'viem';

import type { PositionToken } from './conversion';
import { filterPositionByTokenList } from './token-list';
import type {
  CrossStakingChainPosition,
  CrossStakingChainPositionToken,
} from './use-cross-chain-balances';

const token = (
  name: PositionToken,
  ethValue?: bigint,
): CrossStakingChainPositionToken => ({
  token: name,
  tokenLabel: name as CrossStakingChainPositionToken['tokenLabel'],
  chainId: 1,
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

describe('filterPositionByTokenList', () => {
  it('all: returns the position as is', () => {
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
});
