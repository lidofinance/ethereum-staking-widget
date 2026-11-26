import type { ReactNode } from 'react';

import { parseEther } from 'viem';

import { TOKENS } from 'consts/tokens';
import { formatBalance } from 'utils';

const ONE_ETH = parseEther('1');

type TokenOutDetailsArgs = {
  amountInEth: bigint | null;
  /** symbol of the staked token, for the rate line */
  tokenInLabel: string;
  /** wstETH staking gives on the tokenIn chain; undefined while unknown */
  ethToWsteth?: (eth: bigint) => bigint | undefined;
};

export type TokenOutDetails = {
  /** what staking `amountInEth` gives; undefined while unknown */
  amountOut?: bigint;
  description: ReactNode;
  rate?: ReactNode;
};

/**
 * Extra info of the tokens staking can give. null for any other token:
 * it is shown by its symbol alone, so the list can grow without this.
 */
export const getTokenOutDetails = (
  token: string,
  { amountInEth, tokenInLabel, ethToWsteth }: TokenOutDetailsArgs,
): TokenOutDetails | null => {
  switch (token) {
    case TOKENS.steth:
      return {
        // stETH is 1:1 with ETH
        amountOut: amountInEth ?? undefined,
        description: 'Rebasing token. Balance changes as rewards accrue.',
        rate: `1 ${tokenInLabel} = 1 stETH`,
      };
    case TOKENS.wsteth: {
      const rate = ethToWsteth?.(ONE_ETH);
      return {
        amountOut:
          amountInEth === null ? undefined : ethToWsteth?.(amountInEth),
        description:
          'Non-rebasing token. Its value in stETH changes over time.',
        rate:
          rate === undefined
            ? undefined
            : `1 ${tokenInLabel} ≈ ${formatBalance(rate).trimmed} wstETH`,
      };
    }
    default:
      return null;
  }
};

/** "<amount> <symbol>", or the symbol alone while the amount is unknown */
export const formatTokenOut = (tokenLabel: string, amountOut?: bigint) =>
  amountOut === undefined
    ? tokenLabel
    : `${formatBalance(amountOut).trimmed} ${tokenLabel}`;
