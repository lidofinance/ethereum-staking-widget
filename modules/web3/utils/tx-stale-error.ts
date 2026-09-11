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
