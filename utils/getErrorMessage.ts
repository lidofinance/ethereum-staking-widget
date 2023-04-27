export enum ErrorMessage {
  NOT_ENOUGH_ETHER = 'Not enough ether for gas.',
  DENIED_SIG = 'User denied the transaction signature.',
  SOMETHING_WRONG = 'Something went wrong.',
  LIMIT_REACHED = 'Transaction could not be completed because stake limit is exhausted. Please wait until the stake limit restores and try again. Otherwise, you can swap your Ethereum on 1inch platform instantly.',
}

export const getErrorMessage = (error: unknown): ErrorMessage => {
  try {
    console.error('TX_ERROR:', { error, error_string: JSON.stringify(error) });
  } catch (e) {
    console.error('TX_ERROR:', e);
  }

  const code = extractCodeFromError(error);
  switch (code) {
    case -32000:
      return ErrorMessage.NOT_ENOUGH_ETHER;
    case 3:
      return ErrorMessage.NOT_ENOUGH_ETHER;
    case 'ACTION_REJECTED':
    case 4001:
      return ErrorMessage.DENIED_SIG;
    case 'LIMIT_REACHED':
      return ErrorMessage.LIMIT_REACHED;
    default:
      return ErrorMessage.SOMETHING_WRONG;
  }
};

// type safe error code extractor
const extractCodeFromError = (error: unknown): number | string => {
  // early exit on non object error
  if (!error || typeof error != 'object') return 0;

  if ('reason' in error && Array.isArray(error.reason)) {
    if (error.reason.includes('STAKE_LIMIT')) return 'LIMIT_REACHED';
    // TODO: error.reason more cases
  }

  // sometimes we have error message but bad error code
  if ('message' in error && typeof error.message == 'string') {
    const normalizedMessage = error.message.toLowerCase();
    if (
      normalizedMessage.includes('denied message signature') ||
      normalizedMessage.includes('transaction was rejected')
    )
      return 'ACTION_REJECTED';
  }

  if (
    'code' in error &&
    (typeof error.code === 'string' || typeof error.code == 'number')
  ) {
    return error.code;
  }

  // errors are sometimes nested :(
  if (
    'error' in error &&
    error.error &&
    typeof error.error === 'object' &&
    'code' in error.error &&
    (typeof error.error.code === 'string' ||
      typeof error.error.code == 'number')
  ) {
    return error.error.code;
  }

  return 0;
};
