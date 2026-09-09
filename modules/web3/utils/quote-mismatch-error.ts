/**
 * Thrown when a quote re-fetched right before signing is worse for the user
 * than the one shown in the form. Surfaces as ErrorMessage.QUOTE_CHANGED.
 */
export class QuoteMismatchError extends Error {
  // Picked up by `extractCodeFromError` to resolve ErrorMessage.QUOTE_CHANGED
  code = 'QUOTE_CHANGED';

  constructor() {
    super('Quote changed between preview and submission');
    this.name = 'QuoteMismatchError';
  }
}
