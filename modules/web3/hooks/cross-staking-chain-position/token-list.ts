import type { Address } from 'viem';

import { isSupportedL2Chain } from 'consts/chains';
import { getTokenAddress } from 'config/networks/token-address';
import { TOKENS, TOKEN_SYMBOLS, type TokenSymbol } from 'consts/tokens';

import { POSITION_TOKENS, type PositionToken } from './conversion';
import type {
  CrossStakingChainPosition,
  CrossStakingChainPositionToken,
} from './use-cross-chain-balances';

/** a token on a chain, known without any read */
export type PositionSlot = {
  token: PositionToken;
  tokenLabel: TokenSymbol;
  chainId: number;
  tokenAddress: Address;
};

/**
 * Every position token on every given chain, in chain order and then
 * ETH -> WETH -> stETH -> wstETH. Tokens a chain has no address for are
 * skipped.
 */
export const getPositionSlots = (chainIds: readonly number[]) =>
  chainIds.flatMap((chainId) =>
    POSITION_TOKENS.flatMap((token): PositionSlot[] => {
      const tokenAddress = getTokenAddress(chainId, token);
      return tokenAddress
        ? [{ token, chainId, tokenAddress, tokenLabel: TOKEN_SYMBOLS[token] }]
        : [];
    }),
  );

// stakable: what can be staked; staked: what staking gives you;
// wrappable: what the wrap flows take or give, both ways
export type PositionTokenList = 'stakable' | 'staked' | 'wrappable' | 'all';

type TokenRef = Pick<PositionSlot, 'token' | 'chainId'>;

// L2: a chain with Lido's bridged token contracts, as in getTokenAddress
const isL2 = isSupportedL2Chain;

const isStakable = ({ token }: TokenRef) =>
  token === TOKENS.eth || token === TOKENS.weth;

// L2 stETH is being deprecated: only the wrappable list keeps it,
// so holders can still unwrap and wrap it
const isStaked = ({ token, chainId }: TokenRef) =>
  token === TOKENS.wsteth || (token === TOKENS.steth && !isL2(chainId));

// every token on L1; on an L2 only stETH <-> wstETH, where it has stETH
const isWrappable = ({ token, chainId }: TokenRef) =>
  !isL2(chainId) ||
  ((token === TOKENS.steth || token === TOKENS.wsteth) &&
    !!getTokenAddress(chainId, TOKENS.steth));

const TOKEN_LISTS: Record<PositionTokenList, (ref: TokenRef) => boolean> = {
  stakable: isStakable,
  staked: isStaked,
  wrappable: isWrappable,
  all: (ref) => isStakable(ref) || isStaked(ref),
};

export const isInTokenList = (tokenList: PositionTokenList, ref: TokenRef) =>
  TOKEN_LISTS[tokenList](ref);

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
  const tokens = position.tokens.filter((token) =>
    isInTokenList(tokenList, token),
  );
  if (tokens.length === position.tokens.length) return position;

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
