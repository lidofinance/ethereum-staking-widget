import { z } from 'zod';

import { config } from 'config';
import { isSupportedL2Chain } from 'consts/chains';
import { WETH_UNWRAP_GAS_LIMIT } from 'consts/tx';
import { TOKENS } from 'consts/tokens';
import { BALANCE_PADDING } from 'modules/web3';

import {
  amountSchema,
  isEthLike,
  readIsSmartAccount,
  readMaxTxCost,
  readSpendBalances,
  readStakeLimitInfo,
  spendChecks,
  spendMaxAmount,
  tokenSymbol,
  validAmount,
  withinStakeLimit,
  type SpendBalances,
  type StakeLimitInfo,
} from '../../../../../utils';
import type { StakeRoute } from '../../types';
import {
  isSameChain,
  placeholderSubmit,
  quoteQueryKey,
  routeQueryKey,
} from '../shared';

import { readWstethBySteth } from './reads';

type WrapEthContext = SpendBalances & {
  /** wstETH stakes the ETH, so Lido's stake limit applies */
  stakeLimit: StakeLimitInfo;
  /** ETH cost of the wrap (plus the unwrap for WETH) */
  gasCost: bigint;
  /** AA / contract wallet on tokenIn's chain: no gas checks, full Max */
  isSmartAccount: boolean;
};

/**
 * L1: ETH (or WETH, unwrapped first) straight into wstETH: wstETH stakes
 * and wraps, with referral
 */
export const wrapEthRoute: StakeRoute<WrapEthContext> = {
  id: 'wrap-eth',
  ui: { submitLabel: 'Stake' },

  matches: (pair) =>
    isSameChain(pair) &&
    !isSupportedL2Chain(pair.tokenIn.chainId) &&
    isEthLike(pair.tokenIn.token) &&
    pair.tokenOut.token === TOKENS.wsteth,

  // staking gives stETH 1:1 for ETH; wstETH mints its shares of it, by
  // the contract's own math (rate * amount would round differently)
  quoteQuery: (deps, amount) => ({
    queryKey: quoteQueryKey('wrap-eth', deps, amount),
    queryFn: async () => ({
      amountOut: await readWstethBySteth(
        deps.wagmiConfig,
        deps.tokenIn.chainId,
        amount,
      ),
    }),
  }),

  contextQuery: (deps) => ({
    queryKey: routeQueryKey('wrap-eth', deps),
    queryFn: async () => {
      const { queryClient, wagmiConfig, tokenIn, account, isAA } = deps;
      const { chainId } = tokenIn;
      const gasLimit =
        tokenIn.token === TOKENS.weth
          ? config.WRAP_ETH_GASLIMIT_FALLBACK + WETH_UNWRAP_GAS_LIMIT
          : config.WRAP_ETH_GASLIMIT_FALLBACK;
      const [balances, stakeLimit, gasCost, isSmartAccount] = await Promise.all(
        [
          readSpendBalances(wagmiConfig, tokenIn, account),
          readStakeLimitInfo(wagmiConfig, chainId),
          readMaxTxCost({ queryClient, wagmiConfig, chainId, gasLimit, isAA }),
          readIsSmartAccount({
            queryClient,
            wagmiConfig,
            chainId,
            account,
            isAA,
          }),
        ],
      );
      return {
        ...balances,
        stakeLimit,
        gasCost,
        isSmartAccount,
      };
    },
  }),

  getMaxAmount: (context, { tokenIn }) =>
    spendMaxAmount({
      ...context,
      tokenIn,
      padding: BALANCE_PADDING,
      limit: context.stakeLimit.currentStakeLimit,
    }),

  getSchema: (context, { tokenIn }) => {
    const symbol = tokenSymbol(tokenIn.token);
    return z.object({
      amount: amountSchema(
        validAmount(symbol),
        withinStakeLimit(context.stakeLimit, symbol),
        spendChecks({ ...context, tokenIn }),
      ),
    });
  },

  submit: placeholderSubmit('wrap-eth', { shouldVerifyQuote: true }),
};
