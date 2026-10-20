/**
 * Thrown by a chained flow (unwrap, then stake; approve, then stake) when the
 * preparation transaction settled on-chain but the main one was never sent:
 * the SDK's follow-up read failed in between and the flow stopped there.
 * Unlike TxSettledError the flow is not complete, so the message (an
 * `ErrorMessage` value) says what landed and a Retry continues with the main
 * transaction. Shown as is by `getErrorMessage`.
 */
export class TxFlowInterruptedError extends Error {
  cause: unknown;

  constructor(message: string, cause: unknown) {
    super(message);
    this.name = 'TxFlowInterruptedError';
    this.cause = cause;
  }
}
