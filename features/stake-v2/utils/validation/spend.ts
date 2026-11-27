import { TOKENS } from 'consts/tokens';

import type { TokenOnChain } from '../token';
import { tokenSymbol } from '../token';

import { ethWithGas, tokenWithEthGas, type AmountCheck } from './amount';
import { getMaxAmount } from './max-amount';

type SpendArgs = {
  tokenIn: TokenOnChain;
  /** tokenIn balance */
  balance: bigint;
  /** ETH balance, gas is paid from it */
  etherBalance: bigint;
  /** ETH cost of the whole flow (e.g. unwrap + stake) */
  gasCost: bigint;
  /** AA / contract wallet: can be sponsored, so no gas reserve */
  isSmartAccount: boolean;
};

/** balance and gas checks of spending tokenIn; gas is always paid in ETH */
export const spendChecks = ({
  tokenIn,
  balance,
  etherBalance,
  gasCost,
  isSmartAccount,
}: SpendArgs): AmountCheck =>
  tokenIn.token === TOKENS.eth
    ? ethWithGas({ etherBalance, gasCost, isSmartAccount })
    : tokenWithEthGas({
        symbol: tokenSymbol(tokenIn.token),
        balance,
        etherBalance,
        gasCost,
        isSmartAccount,
      });

type SpendMaxAmountArgs = Omit<SpendArgs, 'etherBalance'> & {
  /** untouchable ETH left to the user */
  padding: bigint;
  /** upper limit, e.g. stake limit or pool capacity */
  limit?: bigint;
};

/**
 * Max of spending tokenIn: ETH keeps the gas cost and `padding` (unless the
 * wallet can be sponsored); any other token is spent whole, gas comes from
 * ETH.
 */
export const spendMaxAmount = ({
  tokenIn,
  balance,
  gasCost,
  isSmartAccount,
  padding,
  limit,
}: SpendMaxAmountArgs) =>
  getMaxAmount({
    balance,
    limit,
    isPadded: tokenIn.token === TOKENS.eth && !isSmartAccount,
    gasCost,
    padding,
  });
