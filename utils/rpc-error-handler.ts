import { ToastError } from '@lidofinance/lido-ui';

const ETHERS_SERVER_ERROR_CODES = [
  'UNKNOWN_ERROR',
  'NOT_IMPLEMENTED',
  'UNSUPPORTED_OPERATION',
  'NETWORK_ERROR',
  'SERVER_ERROR',
  'TIMEOUT',
  'BAD_DATA',
];

export const onRpcProviderError = (payload: unknown) => {
  if (
    payload &&
    typeof payload === 'object' &&
    'error' in payload &&
    payload.error &&
    typeof payload.error === 'object'
  ) {
    const error = payload.error as { code: string; reason: string };
    if (ETHERS_SERVER_ERROR_CODES.includes(error.code.toLocaleUpperCase()))
      ToastError('RPC connection error. Please try again later.', {
        toastId: 'RPC_ERROR',
        hideProgressBar: true,
        closeOnClick: true,
        position: 'bottom-left',
      });
    console.error('[RPC connection error]', error);
  }
};
