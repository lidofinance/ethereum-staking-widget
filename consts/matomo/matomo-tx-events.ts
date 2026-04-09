import { MatomoEventType } from '@lidofinance/analytics-matomo';

export const enum MATOMO_TX_EVENTS_TYPES {
  // Stake
  stakingStart = 'stakingStart',
  stakingFinish = 'stakingFinish',

  // Wrap
  wrapApprovalStart = 'wrapApprovalStart',
  wrapApprovalFinish = 'wrapApprovalFinish',
  wrapStart = 'wrapStart',
  wrapFinish = 'wrapFinish',
  unwrapStart = 'unwrapStart',
  unwrapFinish = 'unwrapFinish',

  // Withdrawal
  withdrawalRequestApprovalStart = 'withdrawalRequestApprovalStart',
  withdrawalRequestApprovalFinish = 'withdrawalRequestApprovalFinish',
  withdrawalRequestStart = 'withdrawalRequestStart',
  withdrawalRequestFinish = 'withdrawalRequestFinish',
  withdrawalClaimStart = 'withdrawalClaimStart',
  withdrawalClaimFinish = 'withdrawalClaimFinish',
}

export const MATOMO_TX_EVENTS: Record<MATOMO_TX_EVENTS_TYPES, MatomoEventType> =
  {
    [MATOMO_TX_EVENTS_TYPES.stakingStart]: [
      'Ethereum_Staking_Widget',
      'Start staking',
      'eth_widget_staking_start',
    ],
    [MATOMO_TX_EVENTS_TYPES.stakingFinish]: [
      'Ethereum_Staking_Widget',
      'Successfully finish staking',
      'eth_widget_staking_finish',
    ],

    [MATOMO_TX_EVENTS_TYPES.wrapApprovalStart]: [
      'Ethereum_Staking_Widget',
      'Start wrap approval',
      'eth_widget_wrap_approval_start',
    ],
    [MATOMO_TX_EVENTS_TYPES.wrapApprovalFinish]: [
      'Ethereum_Staking_Widget',
      'Finish wrap approval',
      'eth_widget_wrap_approval_finish',
    ],

    [MATOMO_TX_EVENTS_TYPES.wrapStart]: [
      'Ethereum_Staking_Widget',
      'Start wrap',
      'eth_widget_wrap_start',
    ],
    [MATOMO_TX_EVENTS_TYPES.wrapFinish]: [
      'Ethereum_Staking_Widget',
      'Finish wrap',
      'eth_widget_wrap_finish',
    ],

    [MATOMO_TX_EVENTS_TYPES.unwrapStart]: [
      'Ethereum_Staking_Widget',
      'Start unwrap',
      'eth_widget_unwrap_start',
    ],
    [MATOMO_TX_EVENTS_TYPES.unwrapFinish]: [
      'Ethereum_Staking_Widget',
      'Finish unwrap',
      'eth_widget_unwrap_finish',
    ],

    [MATOMO_TX_EVENTS_TYPES.withdrawalRequestApprovalStart]: [
      'Ethereum_Staking_Widget',
      'Start withdrawal request approval',
      'eth_widget_withdrawal_request_approval_start',
    ],
    [MATOMO_TX_EVENTS_TYPES.withdrawalRequestApprovalFinish]: [
      'Ethereum_Staking_Widget',
      'Finish withdrawal request approval',
      'eth_widget_withdrawal_request_approval_finish',
    ],
    [MATOMO_TX_EVENTS_TYPES.withdrawalRequestStart]: [
      'Ethereum_Staking_Widget',
      'Start withdrawal request',
      'eth_widget_withdrawal_request_start',
    ],
    [MATOMO_TX_EVENTS_TYPES.withdrawalRequestFinish]: [
      'Ethereum_Staking_Widget',
      'Finish withdrawal request',
      'eth_widget_withdrawal_request_finish',
    ],

    [MATOMO_TX_EVENTS_TYPES.withdrawalClaimStart]: [
      'Ethereum_Staking_Widget',
      'Start withdrawal claim request',
      'eth_widget_withdrawal_claim_start',
    ],
    [MATOMO_TX_EVENTS_TYPES.withdrawalClaimFinish]: [
      'Ethereum_Staking_Widget',
      'Finish withdrawal claim request',
      'eth_widget_withdrawal_claim_finish',
    ],
  };
