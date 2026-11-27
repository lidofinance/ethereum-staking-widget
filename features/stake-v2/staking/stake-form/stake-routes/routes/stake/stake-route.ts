import { z } from 'zod';

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
import { isSameChain, quoteQueryKey, routeQueryKey } from '../shared';

import { readSubmitGasLimit } from './reads';
import { submitStake } from './submit';

type StakeContext = SpendBalances & {
  stakeLimit: StakeLimitInfo;
  /** ETH cost of submit (plus the unwrap for WETH) */
  gasCost: bigint;
  /** AA / contract wallet on tokenIn's chain: no gas checks, full Max */
  isSmartAccount: boolean;
};

/** L1: ETH or WETH into stETH through Lido submit() */
export const stakeRoute: StakeRoute<StakeContext> = {
  id: 'stake',
  ui: { submitLabel: 'Stake' },

  matches: (pair) =>
    isSameChain(pair) &&
    !isSupportedL2Chain(pair.tokenIn.chainId) &&
    isEthLike(pair.tokenIn.token) &&
    pair.tokenOut.token === TOKENS.steth,

  // stETH is minted 1:1 for ETH: nothing to read
  quoteQuery: (deps, amount) => ({
    queryKey: quoteQueryKey('stake', deps, amount),
    queryFn: async () => ({ amountOut: amount }),
  }),

  contextQuery: (deps) => ({
    queryKey: routeQueryKey('stake', deps),
    queryFn: async () => {
      const { queryClient, wagmiConfig, tokenIn, account, isAA } = deps;
      const { chainId } = tokenIn;
      const [balances, stakeLimit, submitGasLimit, isSmartAccount] =
        await Promise.all([
          readSpendBalances(wagmiConfig, tokenIn, account),
          readStakeLimitInfo(wagmiConfig, chainId),
          readSubmitGasLimit(queryClient, wagmiConfig, chainId),
          readIsSmartAccount({
            queryClient,
            wagmiConfig,
            chainId,
            account,
            isAA,
          }),
        ]);
      const gasLimit =
        tokenIn.token === TOKENS.weth
          ? submitGasLimit + WETH_UNWRAP_GAS_LIMIT
          : submitGasLimit;
      const gasCost = await readMaxTxCost({
        queryClient,
        wagmiConfig,
        chainId,
        gasLimit,
        isAA,
      });
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

  submit: (values, _submission, tools) => submitStake(values, tools),
};
