import { TOKENS } from 'consts/tokens';
import { isStepSettled, type TxFlowResult } from 'modules/web3';

import type { RouteSubmitResult } from '../../../../../utils';
import type { StakeRouteSpec, StakeRouteValues } from '../../types';

import { STAKE_STEP } from './steps';

/**
 * How a stake tx flow ended, for the form. Once a WETH unwrap landed the
 * funds are ETH: if the flow then failed in any way, the form switches to
 * ETH so the user sees them, and a retry stakes that ETH
 */
export const stakeSubmitResult = (
  { isSuccess, ctx }: TxFlowResult<unknown>,
  { tokenIn }: StakeRouteValues,
): RouteSubmitResult<StakeRouteSpec> => ({
  isSuccess,
  nextValues:
    !isSuccess && isStepSettled(ctx, STAKE_STEP.unwrap)
      ? { tokenIn: { chainId: tokenIn.chainId, token: TOKENS.eth } }
      : undefined,
});
