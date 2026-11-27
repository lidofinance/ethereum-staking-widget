import { parseEther } from 'viem';

import { TOKENS } from 'consts/tokens';
import { formatBalance } from 'utils';

/** one whole token in, to quote the rate line with */
export const ONE_TOKEN_IN = parseEther('1');

// What staking can give, explained. Only the tokens listed get a blurb; any
// other is shown by its quote alone, so the list can grow without this
const TOKEN_OUT_DESCRIPTIONS: Partial<Record<string, string>> = {
  [TOKENS.steth]: 'Rebasing token. Balance changes as rewards accrue.',
  [TOKENS.wsteth]: 'Non-rebasing token. Its value in stETH changes over time.',
};

export const getTokenOutDescription = (token: string) =>
  TOKEN_OUT_DESCRIPTIONS[token];

/** "<amount> <symbol>", or the symbol alone while the amount is unknown */
export const formatTokenOut = (tokenLabel: string, amountOut?: bigint) =>
  amountOut === undefined
    ? tokenLabel
    : `${formatBalance(amountOut).trimmed} ${tokenLabel}`;

/** "1 ETH = 1 stETH" / "1 ETH ≈ 0.8044 wstETH", from the quote of one token */
export const formatRate = (
  tokenInLabel: string,
  tokenOutLabel: string,
  rateOut?: bigint,
) => {
  if (rateOut === undefined) return undefined;
  if (rateOut === ONE_TOKEN_IN) return `1 ${tokenInLabel} = 1 ${tokenOutLabel}`;
  return `1 ${tokenInLabel} ≈ ${formatBalance(rateOut).trimmed} ${tokenOutLabel}`;
};
