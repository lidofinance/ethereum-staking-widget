import { SendCallsError } from 'modules/web3';
import { UnknownBundleIdError, UserRejectedRequestError } from 'viem';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import debounce from 'lodash/debounce';

import { MATOMO_ERROR_EVENTS_TYPES } from 'consts/matomo/matomo-error-events';

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
  UNAUTHORIZED_PROVIDER = 'Your wallet has not authorized this request.\nReload the page and try again.',
  SITE_BLOCKED = 'Your wallet has temporarily blocked requests from this site.\nUnblock this site in your wallet or try again later.',
  PROVIDER_DISCONNECTED = 'Your wallet is disconnected.\nReconnect your wallet and try again.',
  CHAIN_DISCONNECTED = 'Your wallet is not connected to the selected network.\nSwitch to the selected network in your wallet and try again.',
}

export const getError = (error: unknown): ErrorMessage | string => {
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
    case 'SITE_BLOCKED':
      return ErrorMessage.SITE_BLOCKED;
    case 4100:
      return ErrorMessage.UNAUTHORIZED_PROVIDER;
    case 4900:
      return ErrorMessage.PROVIDER_DISCONNECTED;
    case 4901:
      return ErrorMessage.CHAIN_DISCONNECTED;
    default:
      return ErrorMessage.SOMETHING_WRONG;
  }
};

export const getErrorMessage = (error: unknown): ErrorMessage | string => {
  try {
    console.error('TX_ERROR:', {
      error,
      // JSON.stringify drops non-enumerable Error fields and never walks
      // `cause` — which is exactly where the provider code hides
      cause_chain: describeCauseChain(error),
      error_string: JSON.stringify(error),
    });
  } catch (e) {
    console.error('TX_ERROR:', e);
  }

  const errorMessage = getError(error);
  // To prevent spamming the event on rerender or something else using debounce
  trackErrorDebounced(errorMessage);

  return errorMessage;
};

// Depth cap doubles as a cycle guard: `cause` chains are occasionally circular
const MAX_CAUSE_DEPTH = 5;

// EIP-1193 provider errors we can explain to the user. They never arrive bare:
// the SDK wraps every failure into SDKError and stamps its own bucket code
// (TRANSACTION_ERROR) on top, so the actionable code survives only in `cause`.
const PROVIDER_ERROR_CODES: readonly number[] = [4100, 4900, 4901];

const PROVIDER_ERROR_NAMES: Record<string, number> = {
  unauthorizedprovidererror: 4100,
  providerdisconnectederror: 4900,
  chaindisconnectederror: 4901,
};

const matchProviderError = (error: object): number | null => {
  if (
    'code' in error &&
    typeof error.code === 'number' &&
    PROVIDER_ERROR_CODES.includes(error.code)
  )
    return error.code;

  if ('name' in error && typeof error.name === 'string')
    return PROVIDER_ERROR_NAMES[error.name.toLowerCase()] ?? null;

  return null;
};

// Deliberately matches only codes we can explain. Returning whatever code sits
// deepest would be wrong: viem `cause` chains often bottom out at a raw -32000
const findProviderErrorCode = (
  error: unknown,
  depth = MAX_CAUSE_DEPTH,
): number | null => {
  if (depth <= 0 || !error || typeof error !== 'object') return null;

  return (
    matchProviderError(error) ??
    ('cause' in error ? findProviderErrorCode(error.cause, depth - 1) : null)
  );
};

// MetaMask's "temporarily block this site" prompt (offered after a few
// rejections in a row) rejects every later request with a plain 4100. The
// marker in `details` is the only thing separating it from a generic
// unauthorized error — and the difference matters: the block outlives a page
// reload, so the UNAUTHORIZED_PROVIDER advice would send the user in circles.
const SPAM_FILTER_MARKER = 'spam filter';

// `details` carries it on the viem layer; `message` covers the case where that
// layer was dropped and only the wallet's own error survived
const hasSpamFilterBlock = (
  error: unknown,
  depth = MAX_CAUSE_DEPTH,
): boolean => {
  if (depth <= 0 || !error || typeof error !== 'object') return false;

  const { details, message } = error as {
    details?: unknown;
    message?: unknown;
  };

  return (
    [details, message].some(
      (field) =>
        typeof field === 'string' &&
        field.toLowerCase().includes(SPAM_FILTER_MARKER),
    ) ||
    ('cause' in error && hasSpamFilterBlock(error.cause, depth - 1))
  );
};

const describeCauseChain = (
  error: unknown,
  depth = MAX_CAUSE_DEPTH,
): { name?: unknown; code?: unknown }[] => {
  if (depth <= 0 || !error || typeof error !== 'object') return [];

  const { name, code } = error as { name?: unknown; code?: unknown };

  return [
    { name, code },
    ...('cause' in error ? describeCauseChain(error.cause, depth - 1) : []),
  ];
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

  if (error instanceof UserRejectedRequestError) {
    return 'ACTION_REJECTED';
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
      normalizedMessage.includes('signed declined') ||
      // Ledger cancel wrapped by viem/keyring as InternalRpcError (-32603),
      // where `name`/`code` no longer signal a rejection but the message does
      normalizedMessage.includes('user rejected action')
    )
      return 'ACTION_REJECTED';

    // Wrapped ledger errors (e.g. by viem) lose `name` but keep the message
    if (
      normalizedMessage.includes('blind signing') ||
      normalizedMessage.includes('enable contract data')
    )
      return 'ENABLE_BLIND_SIGNING';

    // hw-app-eth remaps status 0x6a80 to a blind-signing error for
    // transactions but not for EIP-712 — there the raw status reaches us
    if (normalizedMessage.includes('invalid data received'))
      return 'ENABLE_BLIND_SIGNING';

    if (normalizedMessage.includes('locked device')) return 'DEVICE_LOCKED';

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
  // Must run before the provider walk below: a site block arrives as a 4100
  // and would otherwise be answered with the generic unauthorized advice
  if (hasSpamFilterBlock(error)) return 'SITE_BLOCKED';

  // Must run before the generic `code` read below: SDKError's bucket code sits
  // at the top level and would shadow the provider code nested in `cause`
  const providerErrorCode = findProviderErrorCode(error);
  if (providerErrorCode) return providerErrorCode;

  if ('code' in error) {
    if (typeof error.code === 'string') return error.code.toUpperCase();
    if (typeof error.code == 'number') return error.code;
  }

  // errors are sometimes nested :(
  if ('error' in error && shouldDig && error.error) {
    return extractCodeFromError(error.error, false);
  }

  if (
    'data' in error &&
    shouldDig &&
    Array.isArray(error.data) &&
    error.data[0]
  ) {
    return extractCodeFromError(error.data[0], false);
  }

  return 0;
};

// Mapping from ErrorMessage values to MATOMO_ERROR_EVENTS_TYPES
const ERROR_TO_MATOMO_MAP: Record<ErrorMessage, MATOMO_ERROR_EVENTS_TYPES> = {
  [ErrorMessage.NOT_ENOUGH_ETHER]: MATOMO_ERROR_EVENTS_TYPES.NOT_ENOUGH_ETHER,
  [ErrorMessage.DENIED_SIG]: MATOMO_ERROR_EVENTS_TYPES.DENIED_SIG,
  [ErrorMessage.SOMETHING_WRONG]: MATOMO_ERROR_EVENTS_TYPES.SOMETHING_WRONG,
  [ErrorMessage.TRANSACTION_REVERTED]:
    MATOMO_ERROR_EVENTS_TYPES.TRANSACTION_REVERTED,
  [ErrorMessage.ENABLE_BLIND_SIGNING]:
    MATOMO_ERROR_EVENTS_TYPES.ENABLE_BLIND_SIGNING,
  [ErrorMessage.LIMIT_REACHED]: MATOMO_ERROR_EVENTS_TYPES.LIMIT_REACHED,
  [ErrorMessage.DEVICE_LOCKED]: MATOMO_ERROR_EVENTS_TYPES.DEVICE_LOCKED,
  [ErrorMessage.INVALID_REFERRAL]: MATOMO_ERROR_EVENTS_TYPES.INVALID_REFERRAL,
  [ErrorMessage.INVALID_SIGNATURE]: MATOMO_ERROR_EVENTS_TYPES.INVALID_SIGNATURE,
  [ErrorMessage.BUNDLE_NOT_FOUND]: MATOMO_ERROR_EVENTS_TYPES.BUNDLE_NOT_FOUND,
  [ErrorMessage.UNAUTHORIZED_PROVIDER]:
    MATOMO_ERROR_EVENTS_TYPES.UNAUTHORIZED_PROVIDER,
  [ErrorMessage.SITE_BLOCKED]: MATOMO_ERROR_EVENTS_TYPES.SITE_BLOCKED,
  [ErrorMessage.PROVIDER_DISCONNECTED]:
    MATOMO_ERROR_EVENTS_TYPES.PROVIDER_DISCONNECTED,
  [ErrorMessage.CHAIN_DISCONNECTED]:
    MATOMO_ERROR_EVENTS_TYPES.CHAIN_DISCONNECTED,
};

const trackErrorDebounced = debounce((errorMessage: string) => {
  const matomoErrorEventType =
    errorMessage in ERROR_TO_MATOMO_MAP
      ? ERROR_TO_MATOMO_MAP[errorMessage as ErrorMessage]
      : MATOMO_ERROR_EVENTS_TYPES.SOMETHING_WRONG;

  trackMatomoEvent(matomoErrorEventType);
}, 1000);
