import type { TransactionReceipt } from 'viem';

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
