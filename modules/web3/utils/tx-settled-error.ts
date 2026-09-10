import type { Hash } from 'viem';

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
