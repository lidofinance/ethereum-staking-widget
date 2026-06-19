export const TRANSACTION_ERROR = (code?: number) =>
  `Structural verification failed` + (code ? ` (code ${code})` : '');
