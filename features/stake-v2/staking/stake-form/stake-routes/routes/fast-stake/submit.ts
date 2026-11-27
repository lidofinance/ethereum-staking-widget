import invariant from 'tiny-invariant';
import type { Address } from 'viem';

import { TOKENS } from 'consts/tokens';
import {
  LIDO_L2_FAST_STAKE_ETH_GAS_LIMIT_FALLBACK,
  LIDO_L2_FAST_STAKE_WETH_GAS_LIMIT_FALLBACK,
} from 'modules/l2-staking';
import { withRoundUpGasLimit } from 'modules/web3';
import { getReferralAddress } from 'utils/get-referral-address';

import type {
  StakeRouteSubmission,
  StakeRouteSubmitResult,
  StakeRouteSubmitTools,
  StakeRouteValues,
} from '../../types';
import {
  STAKE_STEP,
  stakeModalStages,
  stakeSubmitResult,
  verifyQuote,
} from '../shared';

type FastStakeData = {
  referralAddress: Address;
  // the receiver pulls WETH, so it needs an allowance first. Read here, not
  // taken from the route context, so a retry after a landed approval never
  // approves again
  needsApprove: boolean;
};

/**
 * L2 fast stake: ETH or WETH (approved first) into wstETH from the pool,
 * signed with the fresh quote as the minimum received. See
 * stakeSubmitResult for how it ends.
 */
export const submitFastStake = async <TContext>(
  values: StakeRouteValues,
  submission: StakeRouteSubmission<TContext>,
  tools: StakeRouteSubmitTools,
): Promise<StakeRouteSubmitResult> => {
  const { amount, tokenIn, referral } = values;
  const { core, l2Stake } = tools.lidoSDKL2;
  // the submit button only shows once the wallet is on the form's chain
  invariant(
    core.chainId === tokenIn.chainId,
    'the wallet must be on the chain of the stake',
  );
  const isWeth = tokenIn.token === TOKENS.weth;
  const token = isWeth ? 'WETH' : 'ETH';

  // The quote is re-read last before the wallet: the pool rate moves. A
  // worse one stops the stake, the fresh one is the floor signed for
  const minReceiveAmount = async () =>
    (await verifyQuote(submission)).amountOut;

  const result = await tools.txFlow<FastStakeData>({
    prepare: async () => ({
      // referrals resolve on L1 (ENS)
      referralAddress: await getReferralAddress(
        referral,
        tools.lidoSDK.core.publicClient,
      ),
      needsApprove:
        isWeth &&
        (await l2Stake.getWethAllowanceForFastStake(tools.account)) < amount,
    }),
    // AA wallets sign approve + stake as one batch, built with the floor;
    // EOAs one by one, the floor read right before the stake
    callsFn: async ({ isAA, data }) => [
      data.needsApprove && {
        stepId: STAKE_STEP.approve,
        ...(await l2Stake.approveWethForFastStakePopulateTx({ amount })),
      },
      {
        stepId: STAKE_STEP.stake,
        ...(await l2Stake.fastStakeEthPopulateTx({
          amount,
          token,
          referral: data.referralAddress,
          // EOAs send the stake through sendStep, with its own floor
          minReceiveAmount: isAA ? await minReceiveAmount() : 0n,
        })),
      },
    ],
    sendStep: async (step, callback, { data }) =>
      step.stepId === STAKE_STEP.approve
        ? l2Stake.approveWethForFastStake({ amount, callback })
        : l2Stake.fastStakeEth({
            amount,
            token,
            referral: data.referralAddress,
            minReceiveAmount: await minReceiveAmount(),
            callback: withRoundUpGasLimit(
              callback,
              isWeth
                ? LIDO_L2_FAST_STAKE_WETH_GAS_LIMIT_FALLBACK
                : LIDO_L2_FAST_STAKE_ETH_GAS_LIMIT_FALLBACK,
            ),
          }),
    ...stakeModalStages<FastStakeData, TContext>(values, submission, tools),
  });

  return stakeSubmitResult(result, values);
};
