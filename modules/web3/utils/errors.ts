import type { Hash, TransactionReceipt } from 'viem';

/**
 * Every error the transaction flow raises or classifies, in the order a
 * transaction meets them: before the wallet, at the sender, after the receipt.
 * `getErrorMessage` resolves each to the text the failed stage shows.
 */

/**
 * Thrown by a tx flow when the quote re-read right before sending is worse
 * than the one the form displayed. The flow stops before the wallet is reached
 * and the user is asked to look at the updated amount.
 */
export class QuoteMismatchError extends Error {
  constructor() {
    super('Quote changed between preview and submit');
    this.name = 'QuoteMismatchError';
  }
}

/**
 * Thrown by the tx flow when the UI that started it is gone before the wallet
 * was reached. Aborts the SDK before it sends the request; never shown.
 */
export class TxStaleError extends Error {
  constructor() {
    super('Transaction flow abandoned before signing');
    this.name = 'TxStaleError';
  }
}

/**
 * Thrown by the EIP-5792 sender when the wallet reports a definite outcome
 * for a batch that is not a success: the status is `failure` or a receipt
 * reverted. The outcome is known, so this is an ordinary failed transaction.
 */
export class SendCallsError extends Error {}

export class TransactionRevertedError extends Error {
  // Picked up by `extractCodeFromError` to resolve ErrorMessage.TRANSACTION_REVERTED
  code = 'TRANSACTION_REVERTED';
  receipt: TransactionReceipt;

  constructor(receipt: TransactionReceipt) {
    super('Transaction was included into block but reverted during execution');
    this.name = 'TransactionRevertedError';
    this.receipt = receipt;
  }
}

/**
 * Thrown by the tx flow when the transaction reached the network (a hash or
 * an EIP-5792 call id came back) but its outcome could never be read: the
 * receipt wait timed out, the status poll failed or returned no receipt.
 * The transaction may well have landed, so this must never be presented
 * as a failed transaction with a Retry: the user is told to reload.
 * Resolved to ErrorMessage.BUNDLE_NOT_FOUND by `getErrorMessage`.
 */
export class TxSentDataUnavailableError extends Error {
  cause: unknown;
  txHashOrCallId?: string;

  constructor(cause: unknown, txHashOrCallId?: string) {
    super('Transaction sent but its outcome could not be read');
    this.name = 'TxSentDataUnavailableError';
    this.cause = cause;
    this.txHashOrCallId = txHashOrCallId;
  }
}

/**
 * Thrown by the tx flow when something fails *after* the transaction settled
 * on-chain (confirmations read, balance refresh). The transaction itself is
 * done, so this must never be presented as a failed transaction with a Retry.
 * Resolved to ErrorMessage.TX_SETTLED_DATA_UNAVAILABLE by `getErrorMessage`.
 */
export class TxSettledError extends Error {
  cause: unknown;
  txHash?: Hash;

  constructor(cause: unknown, txHash?: Hash) {
    super('Transaction settled on-chain but a follow-up read failed');
    this.name = 'TxSettledError';
    this.cause = cause;
    this.txHash = txHash;
  }
}

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
