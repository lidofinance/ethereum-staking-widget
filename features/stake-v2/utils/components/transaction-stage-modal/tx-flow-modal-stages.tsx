import invariant from 'tiny-invariant';

import {
  detectTxFlowInterruption,
  type StageCallbacks,
  type TxFlowContext,
} from 'modules/web3';
import { getErrorMessage, isRetryableTxError } from 'utils/getErrorMessage';

import {
  TransactionLink,
  TryAgainButton,
  type TransactionLinkProps,
} from './primitives';
import type {
  TransactionModalContent,
  TransactionStageModalContextValue,
} from './types';

/** what the modal says for one step of a flow */
export type TxStepModalTexts = {
  /** waiting for the user to sign */
  sign: TransactionModalContent;
  /** sent, on its way to a block; the tx link goes under it */
  pending: TransactionModalContent;
};

type TxFlowModalStagesArgs = {
  dispatch: TransactionStageModalContextValue['dispatchTransactionModal'];
  /** the chain the flow sends on: where the tx links point */
  chainId: number;
  /**
   * By step id. An EOA signs every step, so each shows its own sign and
   * pending stages; an AA batch is one signature, shown as its last step
   */
  steps: Record<string, TxStepModalTexts>;
  /** the last step, the action the user came for, landed */
  success: TransactionModalContent;
  /** the last step was proposed to a multisig: no receipt follows */
  multisig: TransactionModalContent;
  /** a failure: its description is the error's message */
  failure: Pick<TransactionModalContent, 'title' | 'subTitle'>;
  /**
   * earlier steps that change what a failure means once they landed (the
   * WETH got unwrapped, the stake was not sent), the most advanced first
   */
  interruptions?: readonly { stepId: string; message: string }[];
  /** offered as Try again when the failure can be retried */
  retry?: () => void;
};

const isLastStep = ({ stepId, calls }: TxFlowContext<unknown>) =>
  !!stepId && stepId === calls.at(-1)?.stepId;

/**
 * The stage callbacks of a stepwise txFlow, as modal stages: spread them
 * into the flow. The flow's context says which step reports and whether it
 * is an AA batch, so the texts are all a flow declares.
 */
export const txFlowModalStages = <TData,>({
  dispatch,
  chainId,
  steps,
  success,
  multisig,
  failure,
  interruptions = [],
  retry,
}: TxFlowModalStagesArgs): StageCallbacks<TData> => {
  const textsOf = ({ stepId }: TxFlowContext<unknown>) => {
    const texts = stepId ? steps[stepId] : undefined;
    invariant(texts, `no modal texts for the step "${stepId}"`);
    return texts;
  };
  // the last sent tx: an AA batch reports a call id, its hash only at DONE
  let sent: TransactionLinkProps | undefined;

  return {
    onSign: ({ ctx }) => dispatch({ type: 'loading', ...textsOf(ctx).sign }),

    onReceipt: ({ txHashOrCallId, isAA, ctx }) => {
      sent = txHashOrCallId && { txId: txHashOrCallId, chainId, isAA };
      dispatch({
        type: 'loading',
        ...textsOf(ctx).pending,
        bottomCTA: sent && <TransactionLink {...sent} />,
      });
    },

    // an earlier step of an EOA: the next step's sign stage follows
    onSuccess: ({ txHash, ctx }) => {
      if (!isLastStep(ctx)) return;
      const tx = txHash ? { txId: txHash, chainId, isAA: false } : sent;
      dispatch({
        type: 'success',
        ...success,
        bottomCTA: tx && <TransactionLink {...tx} />,
      });
    },

    onMultisigDone: ({ ctx }) => {
      if (isLastStep(ctx)) dispatch({ type: 'success', ...multisig });
    },

    onFailure: ({ error, ctx }) => {
      const lastStepId = ctx.calls.at(-1)?.stepId;
      const reported = lastStepId
        ? detectTxFlowInterruption(error, ctx, lastStepId, interruptions)
        : error;
      dispatch({
        type: 'error',
        ...failure,
        description: getErrorMessage(reported),
        bottomCTA: retry && isRetryableTxError(reported) && (
          <TryAgainButton onClick={retry} />
        ),
      });
    },
  };
};
