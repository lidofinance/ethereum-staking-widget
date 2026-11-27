import { formatEther } from 'viem';

import { ErrorMessage } from 'utils/getErrorMessage';

import { tokenSymbol, txFlowModalStages } from '../../../../../utils';
import type {
  StakeRouteSubmission,
  StakeRouteSubmitTools,
  StakeRouteValues,
} from '../../types';

import { STAKE_STEP } from './steps';

// TODO: final texts and amount formatting
const AWAITING_BLOCK = 'Awaiting block confirmation';

/**
 * What the modal shows through a stake: an EOA sees each step (the WETH
 * unwrap or approve, then the stake), an AA batch only the stake
 */
export const stakeModalStages = <TData, TContext>(
  { amount, tokenIn, tokenOut }: StakeRouteValues,
  { quote, retry }: StakeRouteSubmission<TContext>,
  { dispatchTransactionModal }: StakeRouteSubmitTools,
) => {
  const amountIn = `${formatEther(amount)} ${tokenSymbol(tokenIn.token)}`;
  const amountOut = `${formatEther(quote.amountOut)} ${tokenSymbol(tokenOut.token)}`;

  return txFlowModalStages<TData>({
    dispatch: dispatchTransactionModal,
    chainId: tokenIn.chainId,
    retry,
    // a flow uses the ones it has
    steps: {
      [STAKE_STEP.unwrap]: {
        sign: {
          title: 'Confirm WETH unwrap',
          description: `Unwrapping ${amountIn} to stake it`,
        },
        pending: {
          title: 'WETH unwrap in progress',
          description: AWAITING_BLOCK,
        },
      },
      [STAKE_STEP.approve]: {
        sign: {
          title: 'Confirm approval',
          description: `Approving ${amountIn} for staking`,
        },
        pending: { title: 'Approval in progress', description: AWAITING_BLOCK },
      },
      [STAKE_STEP.stake]: {
        sign: {
          title: 'Confirm staking',
          description: `Staking ${amountIn}, you will receive ${amountOut}`,
        },
        pending: { title: 'Staking in progress', description: AWAITING_BLOCK },
      },
    },
    success: {
      title: 'Stake complete',
      description: `${amountOut} will be in your wallet shortly`,
    },
    multisig: {
      title: 'Stake proposed',
      description: 'Confirm the transaction in your multisig wallet',
    },
    failure: { title: 'Transaction failed' },
    // only the steps a flow has can have landed
    interruptions: [
      {
        stepId: STAKE_STEP.unwrap,
        message: ErrorMessage.STAKE_WETH_INTERRUPTED,
      },
      {
        stepId: STAKE_STEP.approve,
        message: ErrorMessage.STAKE_WETH_L2_INTERRUPTED,
      },
    ],
  });
};
