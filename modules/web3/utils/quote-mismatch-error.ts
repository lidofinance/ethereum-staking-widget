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
