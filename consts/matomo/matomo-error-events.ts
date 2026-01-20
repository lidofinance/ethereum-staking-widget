import { MatomoEventType } from '@lidofinance/analytics-matomo';

export const enum MATOMO_ERROR_EVENTS_TYPES {
  NOT_ENOUGH_ETHER = 'NOT_ENOUGH_ETHER',
  DENIED_SIG = 'DENIED_SIG',
  TRANSACTION_REVERTED = 'TRANSACTION_REVERTED',
  ENABLE_BLIND_SIGNING = 'ENABLE_BLIND_SIGNING',
  LIMIT_REACHED = 'LIMIT_REACHED',
  DEVICE_LOCKED = 'DEVICE_LOCKED',
  INVALID_REFERRAL = 'INVALID_REFERRAL',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  BUNDLE_NOT_FOUND = 'BUNDLE_NOT_FOUND',
  SOMETHING_WRONG = 'SOMETHING_WRONG',
}

export const MATOMO_ERROR_EVENTS: Record<
  MATOMO_ERROR_EVENTS_TYPES,
  MatomoEventType
> = {
  [MATOMO_ERROR_EVENTS_TYPES.NOT_ENOUGH_ETHER]: [
    'Ethereum_Staking_Widget_Errors',
    'Not enough ether for gas.',
    'eth_widget_errors_not_enough_ether',
  ],
  [MATOMO_ERROR_EVENTS_TYPES.DENIED_SIG]: [
    'Ethereum_Staking_Widget_Errors',
    'User denied the transaction signature.',
    'eth_widget_errors_user_denied_sig',
  ],
  [MATOMO_ERROR_EVENTS_TYPES.TRANSACTION_REVERTED]: [
    'Ethereum_Staking_Widget_Errors',
    'Transaction was included into block but reverted during execution',
    'eth_widget_errors_transaction_reverted',
  ],
  [MATOMO_ERROR_EVENTS_TYPES.ENABLE_BLIND_SIGNING]: [
    'Ethereum_Staking_Widget_Errors',
    'Please enable blind signing on your Ledger hardware wallet.',
    'eth_widget_errors_enable_blind_signing',
  ],
  [MATOMO_ERROR_EVENTS_TYPES.LIMIT_REACHED]: [
    'Ethereum_Staking_Widget_Errors',
    'Transaction could not be completed because stake limit is exhausted. Please wait until the stake limit restores and try again. Otherwise, you can swap your Ethereum on 1inch platform instantly.',
    'eth_widget_errors_limit_reached',
  ],
  [MATOMO_ERROR_EVENTS_TYPES.DEVICE_LOCKED]: [
    'Ethereum_Staking_Widget_Errors',
    'Please unlock your Ledger hardware wallet',
    'eth_widget_errors_device_locked',
  ],
  [MATOMO_ERROR_EVENTS_TYPES.INVALID_REFERRAL]: [
    'Ethereum_Staking_Widget_Errors',
    'Invalid referral address or ENS',
    'eth_widget_errors_invalid_referral',
  ],
  [MATOMO_ERROR_EVENTS_TYPES.INVALID_SIGNATURE]: [
    'Ethereum_Staking_Widget_Errors',
    'Invalid Permit signature. Perhaps it has expired or already been used. Try submitting a withdrawal request again.',
    'eth_widget_errors_invalid_signature',
  ],
  [MATOMO_ERROR_EVENTS_TYPES.BUNDLE_NOT_FOUND]: [
    'Ethereum_Staking_Widget_Errors',
    'Could not locate transaction. Check your wallet for details.',
    'eth_widget_errors_bundle_not_found',
  ],
  [MATOMO_ERROR_EVENTS_TYPES.SOMETHING_WRONG]: [
    'Ethereum_Staking_Widget_Errors',
    'Something went wrong.',
    'eth_widget_errors_smth_wrong',
  ],
};
