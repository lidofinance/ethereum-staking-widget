import type { TxFlowContext, TxFlowResult } from 'modules/web3';

import type { StakeRouteValues } from '../../types';

import { STAKE_STEP } from './steps';
import { stakeSubmitResult } from './submit-result';

const WETH_STAKE: StakeRouteValues = {
  amount: 1n,
  tokenIn: { chainId: 1, token: 'weth' },
  tokenOut: { chainId: 1, token: 'steth' },
  referral: null,
};

const flowResult = (
  isSuccess: boolean,
  status: TxFlowContext['status'],
): TxFlowResult<unknown> => ({
  ctx: { calls: [], status, isAA: false, data: undefined },
  isSuccess,
  isInterrupted: false,
  isAborted: false,
});

describe('stakeSubmitResult', () => {
  it('a failure after the WETH unwrap landed switches the form to ETH', () => {
    expect(
      stakeSubmitResult(
        flowResult(false, { [STAKE_STEP.unwrap]: 'done' }),
        WETH_STAKE,
      ),
    ).toEqual({
      isSuccess: false,
      nextValues: { tokenIn: { chainId: 1, token: 'eth' } },
    });
  });

  it('a failure before the unwrap landed keeps WETH', () => {
    expect(
      stakeSubmitResult(
        flowResult(false, { [STAKE_STEP.unwrap]: 'sent' }),
        WETH_STAKE,
      ).nextValues,
    ).toBeUndefined();
  });

  it('a stake that landed resets the form, nothing to follow', () => {
    expect(
      stakeSubmitResult(
        flowResult(true, {
          [STAKE_STEP.unwrap]: 'done',
          [STAKE_STEP.stake]: 'done',
        }),
        WETH_STAKE,
      ),
    ).toEqual({ isSuccess: true, nextValues: undefined });
  });
});
