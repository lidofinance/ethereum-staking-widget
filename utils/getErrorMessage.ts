import { SendCallsError } from 'modules/web3';
import { UnknownBundleIdError } from 'viem';

export enum ErrorMessage {
  NOT_ENOUGH_ETHER = 'Not enough ether for gas.',
  DENIED_SIG = 'User denied the transaction signature.',
  SOMETHING_WRONG = 'Something went wrong.',
  TRANSACTION_REVERTED = 'Transaction was included into block but reverted during execution',
  ENABLE_BLIND_SIGNING = 'Please enable blind signing on your Ledger hardware wallet.',
  LIMIT_REACHED = 'Transaction could not be completed because stake limit is exhausted. Please wait until the stake limit restores and try again. Otherwise, you can swap your Ethereum on 1inch platform instantly.',
  DEVICE_LOCKED = 'Please unlock your Ledger hardware wallet',
  INVALID_REFERRAL = 'Invalid referral address or ENS',
  INVALID_SIGNATURE = 'Invalid Permit signature. Perhaps it has expired or already been used. Try submitting a withdrawal request again.',
  BUNDLE_NOT_FOUND = 'Could not locate transaction. Check your wallet for details.',
}

export const getErrorMessage = (error: unknown): ErrorMessage | string => {
  try {
    console.error('TX_ERROR:', { error, error_string: JSON.stringify(error) });
  } catch (e) {
    console.error('TX_ERROR:', e);
  }

  // Try to extract humane error from trusted error types
  const parsedMessage = extractHumaneMessage(error);

  if (parsedMessage) return parsedMessage;

  const code = extractCodeFromError(error);
  switch (code) {
    case -32000: {
      // Handling user-canceled transaction from a safe-app
      if ((error as any)?.message === 'User rejected transaction') {
        return ErrorMessage.DENIED_SIG;
      }
    }
    // intentional fallthrough
    case 3:
    case 'UNPREDICTABLE_GAS_LIMIT':
    case 'INSUFFICIENT_FUNDS':
      return ErrorMessage.NOT_ENOUGH_ETHER;
    case 'INVALID_SIGNATURE':
      return ErrorMessage.INVALID_SIGNATURE;
    case 'ACTION_REJECTED':
    case 4001:
    case 200001:
      return ErrorMessage.DENIED_SIG;
    case 'LIMIT_REACHED':
      return ErrorMessage.LIMIT_REACHED;
    case 'INVALID_REFERRAL':
      return ErrorMessage.INVALID_REFERRAL;
    case 'TRANSACTION_REVERTED':
      return ErrorMessage.TRANSACTION_REVERTED;
    case 'ENABLE_BLIND_SIGNING':
      return ErrorMessage.ENABLE_BLIND_SIGNING;
    case 'DEVICE_LOCKED':
      return ErrorMessage.DEVICE_LOCKED;
    case 'BUNDLE_NOT_FOUND':
    case 5730:
      return ErrorMessage.BUNDLE_NOT_FOUND;
    default:
      return ErrorMessage.SOMETHING_WRONG;
  }
};

// extracts message from Errors made by us
const extractHumaneMessage = (error: unknown) => {
  if (error instanceof SendCallsError) {
    return error.message;
  }

  return null;
};

// type safe error code extractor
export const extractCodeFromError = (
  error: unknown,
  shouldDig = true,
): number | string => {
  // early exit on non object error
  if (!error || typeof error != 'object') return 0;

  if (error instanceof UnknownBundleIdError) {
    return 'BUNDLE_NOT_FOUND';
  }

  if (
    'code' in error &&
    error.code === 'CALL_EXCEPTION' &&
    'receipt' in error
  ) {
    const receipt = error.receipt as { blockHash?: string };
    if (receipt.blockHash?.startsWith('0x')) return 'TRANSACTION_REVERTED';
  }

  if (
    'cause' in error &&
    typeof error.cause === 'object' &&
    error.cause &&
    'details' in error.cause &&
    typeof error.cause.details == 'string' &&
    error.cause.details.toLowerCase().includes('user reject')
  ) {
    return 'ACTION_REJECTED';
  }

  if ('reason' in error && typeof error.reason == 'string') {
    if (error.reason.includes('STAKE_LIMIT')) return 'LIMIT_REACHED';
    if (error.reason.includes('INVALID_REFERRAL')) return 'INVALID_REFERRAL';
    if (error.reason.includes('INVALID_SIGNATURE')) return 'INVALID_SIGNATURE';
  }

  // sometimes we have error message but bad error code
  if ('message' in error && typeof error.message == 'string') {
    const normalizedMessage = error.message.toLowerCase();
    if (
      normalizedMessage.includes('denied message signature') ||
      normalizedMessage.includes('transaction was rejected') ||
      normalizedMessage.includes('rejected the transaction') ||
      normalizedMessage.includes('rejected the request') ||
      normalizedMessage.includes('reject this request') ||
      normalizedMessage.includes('rejected methods') ||
      normalizedMessage.includes('transaction declined') ||
      normalizedMessage.includes('signed declined')
    )
      return 'ACTION_REJECTED';

    if (normalizedMessage.includes('not enough ether for gas'))
      return 'INSUFFICIENT_FUNDS';
  }

  if ('name' in error && typeof error.name == 'string') {
    const error_name = error.name.toLowerCase();
    if (error_name === 'EthAppPleaseEnableContractData'.toLowerCase())
      return 'ENABLE_BLIND_SIGNING';
    if (error_name === 'LockedDeviceError'.toLowerCase()) {
      return 'DEVICE_LOCKED';
    }
  }
  if ('code' in error) {
    if (typeof error.code === 'string') return error.code.toUpperCase();
    if (typeof error.code == 'number') return error.code;
  }

  // errors are sometimes nested :(
  if ('error' in error && shouldDig && error.error) {
    return extractCodeFromError(error.error, false);
  }

  return 0;
};
