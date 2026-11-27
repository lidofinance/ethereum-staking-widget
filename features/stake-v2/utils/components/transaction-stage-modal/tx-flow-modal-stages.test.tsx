import { TransactionCallbackStage } from '@lidofinance/lido-ethereum-sdk/core';
import type { Hash } from 'viem';

import type { TxFlowContext } from 'modules/web3';
import { ErrorMessage } from 'utils/getErrorMessage';

import { txFlowModalStages } from './tx-flow-modal-stages';
import type { TransactionModalAction } from './types';

const TX: Hash =
  '0x1111111111111111111111111111111111111111111111111111111111111111';
const CALL_ID = '0xcall' as Hash;
const STEPS = ['unwrap', 'stake'] as const;

const ctxOf = (
  stepId: (typeof STEPS)[number],
  { isAA = false, status = {} } = {},
): TxFlowContext => ({
  stepId,
  calls: STEPS.map((id) => ({ stepId: id, to: '0x0' })),
  status,
  isAA,
  data: undefined,
});

const setup = ({ retry }: { retry?: () => void } = {}) => {
  const shown: TransactionModalAction[] = [];
  const stages = txFlowModalStages({
    dispatch: (action) => shown.push(action),
    chainId: 1,
    steps: {
      unwrap: {
        sign: { title: 'sign unwrap' },
        pending: { title: 'unwrapping' },
      },
      stake: { sign: { title: 'sign stake' }, pending: { title: 'staking' } },
    },
    success: { title: 'done' },
    multisig: { title: 'proposed' },
    failure: { title: 'failed' },
    interruptions: [{ stepId: 'unwrap', message: 'unwrapped only' }],
    retry,
  });
  const titles = () =>
    shown.map((action) => ('title' in action ? action.title : action.type));
  return { stages, shown, titles };
};

describe('txFlowModalStages', () => {
  it('an EOA sees every step, and success only after the last one', async () => {
    const { stages, titles } = setup();
    for (const stepId of STEPS) {
      const ctx = ctxOf(stepId);
      const common = { isAA: false, ctx };
      await stages.onSign?.({
        stage: TransactionCallbackStage.SIGN,
        ...common,
      });
      await stages.onReceipt?.({
        stage: TransactionCallbackStage.RECEIPT,
        txHashOrCallId: TX,
        ...common,
      });
      await stages.onSuccess?.({
        stage: TransactionCallbackStage.DONE,
        txHash: TX,
        ...common,
      });
    }
    expect(titles()).toEqual([
      'sign unwrap',
      'unwrapping',
      'sign stake',
      'staking',
      'done',
    ]);
  });

  it('an AA batch shows only its last step', async () => {
    const { stages, titles, shown } = setup();
    const common = { isAA: true, ctx: ctxOf('stake', { isAA: true }) };
    await stages.onSign?.({ stage: TransactionCallbackStage.SIGN, ...common });
    await stages.onReceipt?.({
      stage: TransactionCallbackStage.RECEIPT,
      txHashOrCallId: CALL_ID,
      ...common,
    });
    await stages.onSuccess?.({
      stage: TransactionCallbackStage.DONE,
      ...common,
    });
    expect(titles()).toEqual(['sign stake', 'staking', 'done']);
    // no tx hash at DONE: the call id link stays
    const success = shown.at(-1);
    expect(success && 'bottomCTA' in success && success.bottomCTA).toBeTruthy();
  });

  it('a failure after the unwrap landed says so, with Try again', async () => {
    const retry = vi.fn();
    const { stages, shown } = setup({ retry });
    await stages.onFailure?.({
      stage: TransactionCallbackStage.ERROR,
      error: new Error(ErrorMessage.SOMETHING_WRONG),
      isAA: false,
      ctx: ctxOf('stake', { status: { unwrap: 'settled' } }),
    });
    const failure = shown.at(-1);
    expect(failure).toMatchObject({
      type: 'error',
      title: 'failed',
      description: 'unwrapped only',
    });
    expect(failure && 'bottomCTA' in failure && failure.bottomCTA).toBeTruthy();
  });

  it('a multisig proposal of the last step is its success', async () => {
    const { stages, titles } = setup();
    await stages.onMultisigDone?.({
      stage: TransactionCallbackStage.MULTISIG_DONE,
      isAA: false,
      ctx: ctxOf('stake'),
    });
    expect(titles()).toEqual(['proposed']);
  });
});
