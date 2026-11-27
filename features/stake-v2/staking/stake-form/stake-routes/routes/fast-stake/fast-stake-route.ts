import { z } from 'zod';

import { isSupportedL2StakingChain } from 'consts/chains';
import { TOKENS } from 'consts/tokens';
import {
  LIDO_L2_FAST_STAKE_ETH_GAS_LIMIT_FALLBACK,
  LIDO_L2_FAST_STAKE_WETH_GAS_LIMIT_FALLBACK,
  LIDO_L2_WETH_APPROVE_GAS_LIMIT_FALLBACK,
  calcFastStakeWstethByEth,
} from 'modules/l2-staking';
import { BALANCE_PADDING_L2, getPrettyChainName } from 'modules/web3';

import {
  amountSchema,
  atMostWith,
  errorTexts,
  available,
  isEthLike,
  readIsSmartAccount,
  readMaxTxCost,
  readSpendBalances,
  spendChecks,
  spendMaxAmount,
  tokenSymbol,
  validAmount,
  type SpendBalances,
} from '../../../../../utils';
import type { L2StakeState, StakeRoute } from '../../types';
import { isSameChain, quoteQueryKey, routeQueryKey } from '../shared';

import {
  fastStakeEstimateTx,
  readFastStakeLiquidity,
  readFastStakeRate,
  readWethAllowance,
} from './reads';
import { submitFastStake } from './submit';

type FastStakeContext = SpendBalances &
  L2StakeState & {
    /** pool wstETH, valued in ETH at the pool price and fee */
    ethLiquidity: bigint;
    /** ETH cost of the stake, plus the WETH approve when it may be needed */
    gasCost: bigint;
    /** AA / contract wallet on tokenIn's chain: no gas checks, full Max */
    isSmartAccount: boolean;
  };

const liquidityMessage =
  (
    { ethLiquidity, liquidityTargetEth }: FastStakeContext,
    symbol: string,
    chainId: number,
  ) =>
  (amount: bigint) => {
    const chain = getPrettyChainName(chainId);
    // without a target, the plain cap
    if (liquidityTargetEth === undefined) {
      return errorTexts.forms.stake.poolLimitExceeded(
        symbol,
        chain,
        ethLiquidity,
      );
    }
    // below the target the pool refills soon; above it, it never holds this
    return amount <= liquidityTargetEth
      ? errorTexts.forms.stake.poolTemporarilyExhausted(symbol, chain)
      : errorTexts.forms.stake.poolCapacityExceeded(symbol, chain);
  };

/** L2: ETH or WETH into wstETH from the chain's fast stake pool */
export const fastStakeRoute: StakeRoute<FastStakeContext> = {
  id: 'fast-stake',
  ui: { submitLabel: 'Stake' },

  matches: (pair) =>
    isSameChain(pair) &&
    isSupportedL2StakingChain(pair.tokenIn.chainId) &&
    isEthLike(pair.tokenIn.token) &&
    pair.tokenOut.token === TOKENS.wsteth,

  // the pool's own formula on its fee and oracle price, read fresh with
  // every quote so a refreshed quote is a refreshed rate
  quoteQuery: (deps, amount) => ({
    queryKey: quoteQueryKey('fast-stake', deps, amount),
    queryFn: async () => {
      const { feeRate, price } = await readFastStakeRate(
        deps.wagmiConfig,
        deps.tokenIn.chainId,
      );
      return { amountOut: calcFastStakeWstethByEth(amount, feeRate, price) };
    },
  }),

  contextQuery: (deps) => {
    const { queryClient, wagmiConfig, tokenIn, account, isAA } = deps;
    const { chainId } = tokenIn;
    const l2State = deps.getL2StakeState(chainId);
    return {
      // the remote config can turn the chain off or move the target
      queryKey: [...routeQueryKey('fast-stake', deps), l2State],
      queryFn: async () => {
        const isWeth = tokenIn.token === TOKENS.weth;
        const [balances, ethLiquidity, allowance, isSmartAccount] =
          await Promise.all([
            readSpendBalances(wagmiConfig, tokenIn, account),
            readFastStakeLiquidity(wagmiConfig, chainId),
            isWeth ? readWethAllowance(wagmiConfig, chainId, account) : null,
            readIsSmartAccount({
              queryClient,
              wagmiConfig,
              chainId,
              account,
              isAA,
            }),
          ]);
        // fallbacks as limits: the estimate account cannot stake on every
        // chain, and the limits are upper bounds by design. The approve
        // counts while the allowance may not cover the balance
        const gasLimit = isWeth
          ? LIDO_L2_FAST_STAKE_WETH_GAS_LIMIT_FALLBACK +
            (allowance !== null && allowance >= balances.balance
              ? 0n
              : LIDO_L2_WETH_APPROVE_GAS_LIMIT_FALLBACK)
          : LIDO_L2_FAST_STAKE_ETH_GAS_LIMIT_FALLBACK;
        const gasCost = await readMaxTxCost({
          queryClient,
          wagmiConfig,
          chainId,
          gasLimit,
          tx: fastStakeEstimateTx(chainId),
          isAA,
        });
        return {
          ...balances,
          ...l2State,
          ethLiquidity,
          gasCost,
          isSmartAccount,
        };
      },
    };
  },

  getMaxAmount: (context, { tokenIn }) =>
    spendMaxAmount({
      ...context,
      tokenIn,
      padding: BALANCE_PADDING_L2,
      limit: context.ethLiquidity,
    }),

  getSchema: (context, { tokenIn }) => {
    const symbol = tokenSymbol(tokenIn.token);
    return z.object({
      amount: amountSchema(
        available(context.unavailableReason),
        validAmount(symbol),
        atMostWith(
          context.ethLiquidity,
          liquidityMessage(context, symbol, tokenIn.chainId),
        ),
        spendChecks({ ...context, tokenIn }),
      ),
    });
  },

  submit: submitFastStake,
};
