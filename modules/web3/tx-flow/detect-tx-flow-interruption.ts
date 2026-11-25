import {
  QuoteMismatchError,
  TxFlowInterruptedError,
  TxSentDataUnavailableError,
  TxSettledError,
  TxStaleError,
} from '../utils/errors';
import { isStepSent, isStepSettled } from './context';
import type { TxFlowContext } from './types';
import { getError, ErrorMessage } from 'utils/getErrorMessage';

/**
 * Detects a completed preparation followed by an unsent main transaction.
 *
 * Preserves quote changes, stale flows, unknown transaction outcomes and
 * actionable wallet errors. A failed follow-up read after preparation settled
 * can still be reported as an interruption: the main action remains incomplete.
 *
 * @param error - The failure reported by the transaction flow.
 * @param ctx - The flow context recording how far each transaction step reached.
 * @param mainStep - The main transaction's step ID. Once sent, its error is
 * preserved rather than reported as a preparation interruption.
 * @param preparations - Preparation step IDs and their user-facing interruption
 * messages, ordered from the most advanced step to the earliest. The first
 * settled step supplies the message.
 * @returns An interruption error describing the completed preparation, or the
 * original error when interruption messaging does not apply.
 */
export const detectTxFlowInterruption = (
  error: unknown,
  ctx: TxFlowContext<unknown>,
  mainStep: string,
  preparations: readonly { stepId: string; message: string }[],
) => {
  if (
    isStepSent(ctx, mainStep) ||
    error instanceof QuoteMismatchError ||
    error instanceof TxSentDataUnavailableError ||
    error instanceof TxStaleError
  )
    return error;

  // Generic failures and declined signatures gain preparation context;
  // actionable guidance, such as funding gas or reconnecting, stays intact.
  const reason = getError(error);
  if (
    !(error instanceof TxSettledError) &&
    reason !== ErrorMessage.SOMETHING_WRONG &&
    reason !== ErrorMessage.DENIED_SIG
  )
    return error;

  const completed = preparations.find(({ stepId }) =>
    isStepSettled(ctx, stepId),
  );
  return completed
    ? new TxFlowInterruptedError(
        completed.message,
        error instanceof TxSettledError ? error.cause : error,
      )
    : error;
};
