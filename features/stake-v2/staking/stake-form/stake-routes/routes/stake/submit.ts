import invariant from 'tiny-invariant';
import { encodeFunctionData, type Address } from 'viem';
import { StethAbi } from '@lidofinance/lido-ethereum-sdk/stake';

import { config } from 'config';
import { TOKENS } from 'consts/tokens';
import { withRoundUpGasLimit } from 'modules/web3';
import { getReferralAddress } from 'utils/get-referral-address';

import { getTokenAddressOrThrow } from '../../../../../utils';
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
} from '../shared';

type StakeData = {
  referralAddress: Address;
};

/**
 * L1 stake: Lido submit() with the referral, after a WETH unwrap for WETH.
 * See stakeSubmitResult for how it ends.
 */
export const submitStake = async <TContext>(
  values: StakeRouteValues,
  submission: StakeRouteSubmission<TContext>,
  tools: StakeRouteSubmitTools,
): Promise<StakeRouteSubmitResult> => {
  const { amount, tokenIn, referral } = values;
  const { core, stake } = tools.lidoSDK;
  // the submit button only shows once the wallet is on the form's chain
  invariant(
    core.chainId === tokenIn.chainId,
    'the wallet must be on the chain of the stake',
  );

  const result = await tools.txFlow<StakeData>({
    prepare: async () => ({
      referralAddress: await getReferralAddress(referral, core.publicClient),
    }),
    // AA wallets sign unwrap + submit as one batch, EOAs one by one. The
    // submit is encoded without a gas estimate: for WETH the ETH only
    // exists once the unwrap landed
    callsFn: async ({ data }) => [
      tokenIn.token === TOKENS.weth && unwrapWethStep(tokenIn.chainId, amount),
      {
        stepId: STAKE_STEP.stake,
        to: getTokenAddressOrThrow(tokenIn.chainId, TOKENS.steth),
        data: encodeFunctionData({
          abi: StethAbi,
          functionName: 'submit',
          args: [data.referralAddress],
        }),
        value: amount,
      },
    ],
    sendStep: (step, callback, { data }) =>
      step.stepId === STAKE_STEP.unwrap
        ? sendUnwrapWeth(core, amount, callback)
        : stake.stakeEth({
            value: amount,
            referralAddress: data.referralAddress,
            callback: withRoundUpGasLimit(
              callback,
              config.STAKE_GASLIMIT_FALLBACK,
            ),
          }),
    ...stakeModalStages<StakeData, TContext>(values, submission, tools),
  });

  return stakeSubmitResult(result, values);
};
