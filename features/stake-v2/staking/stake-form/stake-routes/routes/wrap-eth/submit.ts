import invariant from 'tiny-invariant';
import type { Address } from 'viem';

import { TOKENS } from 'consts/tokens';
import { getReferralAddress } from 'utils/get-referral-address';

import type {
  StakeRouteSubmission,
  StakeRouteSubmitResult,
  StakeRouteSubmitTools,
  StakeRouteValues,
} from '../../types';
import {
  STAKE_STEP,
  sendUnwrapWeth,
  stakeModalStages,
  stakeSubmitResult,
  unwrapWethStep,
  verifyQuote,
} from '../shared';

type WrapEthData = {
  referralAddress: Address;
};

/**
 * L1 ETH to wstETH: the wstETH referral staker stakes and wraps in one
 * call, after a WETH unwrap for WETH. The quote is checked first: wstETH
 * minted per ETH moves with the share rate. See stakeSubmitResult for how
 * it ends.
 */
export const submitWrapEth = async <TContext>(
  values: StakeRouteValues,
  submission: StakeRouteSubmission<TContext>,
  tools: StakeRouteSubmitTools,
): Promise<StakeRouteSubmitResult> => {
  const { amount, tokenIn, referral } = values;
  const { core, wrap } = tools.lidoSDK;
  // the submit button only shows once the wallet is on the form's chain
  invariant(
    core.chainId === tokenIn.chainId,
    'the wallet must be on the chain of the stake',
  );

  const result = await tools.txFlow<WrapEthData>({
    prepare: async () => {
      await verifyQuote(submission);
      return {
        referralAddress: await getReferralAddress(referral, core.publicClient),
      };
    },
    // the SDK builds the call without a gas estimate: for WETH the ETH only
    // exists once the unwrap landed
    callsFn: async ({ data }) => {
      const { to, data: callData } = await wrap.wrapEthPopulateTx({
        value: amount,
        referralAddress: data.referralAddress,
      });
      return [
        tokenIn.token === TOKENS.weth &&
          unwrapWethStep(tokenIn.chainId, amount),
        { stepId: STAKE_STEP.stake, to, data: callData, value: amount },
      ];
    },
    sendStep: (step, callback, { data }) =>
      step.stepId === STAKE_STEP.unwrap
        ? sendUnwrapWeth(core, amount, callback)
        : wrap.wrapEth({
            value: amount,
            referralAddress: data.referralAddress,
            callback,
          }),
    ...stakeModalStages<WrapEthData, TContext>(values, submission, tools),
  });

  return stakeSubmitResult(result, values);
};
