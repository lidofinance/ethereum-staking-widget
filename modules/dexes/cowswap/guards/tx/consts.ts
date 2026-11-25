export const TRANSACTION_ERROR = (code?: number) =>
  `Structural verification failed` + (code ? ` (code ${code})` : '');

// Ledger Live cannot distinguish blind signing disabled from a user cancel —
// the modal states the decline, the tooltip hints at blind signing
export const SIGN_DECLINED_MESSAGE = 'Signature request was declined.';

export const SIGN_DECLINED_HELP_TIP = {
  label: 'Why did my transaction fail?',
  text: 'If you did not cancel the request yourself, blind signing may be disabled. Enable it in the Ethereum app settings on your Ledger device and try again.',
};
