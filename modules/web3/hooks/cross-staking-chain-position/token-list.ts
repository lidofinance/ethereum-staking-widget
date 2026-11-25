import { TOKENS } from 'consts/tokens';

import { POSITION_TOKENS, type PositionToken } from './conversion';
import type {
  CrossStakingChainPosition,
  CrossStakingChainPositionToken,
} from './use-cross-chain-balances';

// stakable: what can be staked; staked: what staking gives you
export type PositionTokenList = 'stakable' | 'staked' | 'all';

const TOKEN_LISTS: Record<PositionTokenList, readonly PositionToken[]> = {
  stakable: [TOKENS.eth, TOKENS.weth],
  staked: [TOKENS.steth, TOKENS.wsteth],
  all: POSITION_TOKENS,
};

type FilterPositionByTokenListArgs = {
  position: CrossStakingChainPosition;
  tokenList: PositionTokenList;
  ethToUsd: (ethAmount: bigint) => number | undefined;
};

/**
 * Keeps only the tokens of `tokenList` and recomputes the totals over them,
 * so the totals always match the listed tokens.
 */
export const filterPositionByTokenList = ({
  position,
  tokenList,
  ethToUsd,
}: FilterPositionByTokenListArgs): CrossStakingChainPosition => {
  if (tokenList === 'all') return position;

  const allowed = TOKEN_LISTS[tokenList];
  const tokens = position.tokens.filter(({ token }) => allowed.includes(token));
  const totalEthValue = sumEthValue(tokens);

  return {
    tokens,
    totalEthValue,
    // from the ETH total, not a sum of per-token floats
    totalUsdValue: ethToUsd(totalEthValue),
  };
};

// sum over tokens with a known ethValue
const sumEthValue = (tokens: readonly CrossStakingChainPositionToken[]) =>
  tokens.reduce((sum, { ethValue }) => sum + (ethValue ?? 0n), 0n);
