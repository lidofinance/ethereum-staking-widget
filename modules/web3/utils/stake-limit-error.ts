/**
 * Thrown by a tx flow when a limit re-read right before sending no longer
 * admits the amount: the send would revert, so the flow stops before the
 * wallet is reached. The message says what fits now and is shown as is.
 */
export class StakeLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StakeLimitError';
  }
}
