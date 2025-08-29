import { MatomoEventType } from '@lidofinance/analytics-matomo';

export const enum MATOMO_EARN_EVENTS_TYPES {
  // GGV Deposit
  ggvDeposit = 'ggvDeposit',
  ggvDepositTabClick = 'ggvDepositTabClick',
  ggvSelectTokenEth = 'ggvSelectTokenEth',
  ggvSelectTokenWeth = 'ggvSelectTokenWeth',
  ggvSelectTokenSteth = 'ggvSelectTokenSteth',
  ggvSelectTokenWsteth = 'ggvSelectTokenWsteth',
  ggvDepositInputMaxClick = 'ggvDepositInputMaxClick',
  ggvDepositStart = 'ggvDepositStart',
  ggvDepositFinish = 'ggvDepositFinish',

  // GGV Withdraw
  ggvWithdrawTabClick = 'ggvWithdrawTabClick',
  ggvWithdrawInputMaxClick = 'ggvWithdrawInputMaxClick',
  ggvWithdrawStart = 'ggvWithdrawStart',
  ggvWithdrawFinish = 'ggvWithdrawFinish',
  ggvWithdrawCancel = 'ggvWithdrawCancel',

  // GGV Common
  ggvBackToAllVaults = 'ggvBackToAllVaults',

  // DVV Deposit
  dvvDeposit = 'dvvDeposit',
  dvvDepositTabClick = 'dvvDepositTabClick',
  dvvSelectTokenEth = 'dvvSelectTokenEth',
  dvvSelectTokenWeth = 'dvvSelectTokenWeth',
  dvvDepositInputMaxClick = 'dvvDepositInputMaxClick',
  dvvDepositStart = 'dvvDepositStart',
  dvvDepositFinish = 'dvvDepositFinish',

  // DVV Withdraw
  dvvWithdrawTabClick = 'dvvWithdrawTabClick',
  dvvWithdrawInputMaxClick = 'dvvWithdrawInputMaxClick',
  dvvWithdrawStart = 'dvvWithdrawStart',
  dvvWithdrawFinish = 'dvvWithdrawFinish',
  dvvRewardsClaimSsv = 'dvvRewardsClaimSsv',
  dvvRewardsClaimObol = 'dvvRewardsClaimObol',

  // DVV Common
  dvvBackToAllVaults = 'dvvBackToAllVaults',
}

export const MATOMO_EARN_EVENTS: Record<
  MATOMO_EARN_EVENTS_TYPES,
  MatomoEventType
> = {
  [MATOMO_EARN_EVENTS_TYPES.ggvDeposit]: [
    'Ethereum_Earn_Widget',
    'Click "Deposit" on Lido GGV on the list of vaults',
    'eth_earn_list_lido_ggv_deposit',
  ],
  [MATOMO_EARN_EVENTS_TYPES.ggvDepositTabClick]: [
    'Ethereum_Earn_Widget',
    'Click on Deposit tab on Lido GGV',
    'eth_earn_lido_ggv_deposit_tab',
  ],
  [MATOMO_EARN_EVENTS_TYPES.ggvSelectTokenEth]: [
    'Ethereum_Earn_Widget',
    'Select ETH to deposit on Lido GGV',
    'eth_earn_lido_ggv_select_token_eth',
  ],
  [MATOMO_EARN_EVENTS_TYPES.ggvSelectTokenWeth]: [
    'Ethereum_Earn_Widget',
    'Select WETH to deposit on Lido GGV',
    'eth_earn_lido_ggv_select_token_weth',
  ],
  [MATOMO_EARN_EVENTS_TYPES.ggvSelectTokenSteth]: [
    'Ethereum_Earn_Widget',
    'Select stETH to deposit on Lido GGV',
    'eth_earn_lido_ggv_select_token_steth',
  ],
  [MATOMO_EARN_EVENTS_TYPES.ggvSelectTokenWsteth]: [
    'Ethereum_Earn_Widget',
    'Select wstETH to deposit on Lido GGV',
    'eth_earn_lido_ggv_select_token_wsteth',
  ],
  [MATOMO_EARN_EVENTS_TYPES.ggvDepositInputMaxClick]: [
    'Ethereum_Earn_Widget',
    'Click on "Max" in input on Deposit tab on Lido GGV',
    'eth_earn_lido_ggv_deposit_max',
  ],
  [MATOMO_EARN_EVENTS_TYPES.ggvDepositStart]: [
    'Ethereum_Earn_Widget',
    'Initiating depositing transaction on Lido GGV',
    'eth_earn_lido_ggv_depositing_start',
  ],
  [MATOMO_EARN_EVENTS_TYPES.ggvDepositFinish]: [
    'Ethereum_Earn_Widget',
    'Successful finish depositing transaction on Lido GGV',
    'eth_earn_lido_ggv_depositing_finish',
  ],
  [MATOMO_EARN_EVENTS_TYPES.ggvWithdrawTabClick]: [
    'Ethereum_Earn_Widget',
    'Click on Withdrawal tab on Lido GGV',
    'eth_earn_lido_ggv_withdrawal_tab',
  ],
  [MATOMO_EARN_EVENTS_TYPES.ggvWithdrawInputMaxClick]: [
    'Ethereum_Earn_Widget',
    'Click on "Max" in input on Withdrawal tab on Lido GGV',
    'eth_earn_lido_ggv_withdrawal_max',
  ],
  [MATOMO_EARN_EVENTS_TYPES.ggvWithdrawStart]: [
    'Ethereum_Earn_Widget',
    'Initiating withdrawal transaction on Lido GGV',
    'eth_earn_lido_ggv_withdrawal_start',
  ],
  [MATOMO_EARN_EVENTS_TYPES.ggvWithdrawFinish]: [
    'Ethereum_Earn_Widget',
    'Successful finish withdrawal transaction on Lido GGV',
    'eth_earn_lido_ggv_withdrawal_finish',
  ],
  [MATOMO_EARN_EVENTS_TYPES.ggvWithdrawCancel]: [
    'Ethereum_Earn_Widget',
    'Click on "Cancel" withdrawal tab on Lido GGV',
    'eth_earn_lido_ggv_withdrawal_cancel',
  ],
  [MATOMO_EARN_EVENTS_TYPES.ggvBackToAllVaults]: [
    'Ethereum_Earn_Widget',
    'Click on "Back to all vaults" on Lido GGV',
    'eth_earn_lido_ggv_back_to_all_vaults',
  ],
  [MATOMO_EARN_EVENTS_TYPES.dvvDeposit]: [
    'Ethereum_Earn_Widget',
    'Click "Deposit" on Lido DDV on the list of vaults',
    'eth_earn_list_lido_ddv_deposit',
  ],
  [MATOMO_EARN_EVENTS_TYPES.dvvDepositTabClick]: [
    'Ethereum_Earn_Widget',
    'Click on Deposit tab on Lido DVV',
    'eth_earn_lido_dvv_deposit_tab',
  ],
  [MATOMO_EARN_EVENTS_TYPES.dvvSelectTokenEth]: [
    'Ethereum_Earn_Widget',
    'Select ETH to deposit on Lido DVV',
    'eth_earn_lido_dvv_select_token_eth',
  ],
  [MATOMO_EARN_EVENTS_TYPES.dvvSelectTokenWeth]: [
    'Ethereum_Earn_Widget',
    'Select WETH to deposit on Lido DVV',
    'eth_earn_lido_dvv_select_token_weth',
  ],
  [MATOMO_EARN_EVENTS_TYPES.dvvDepositInputMaxClick]: [
    'Ethereum_Earn_Widget',
    'Click on "Max" in input on Deposit tab on Lido DVV',
    'eth_earn_lido_dvv_deposit_max',
  ],
  [MATOMO_EARN_EVENTS_TYPES.dvvDepositStart]: [
    'Ethereum_Earn_Widget',
    'Initiating depositing transaction on Lido DVV',
    'eth_earn_lido_dvv_depositing_start',
  ],
  [MATOMO_EARN_EVENTS_TYPES.dvvDepositFinish]: [
    'Ethereum_Earn_Widget',
    'Successful finish depositing transaction on Lido DVV',
    'eth_earn_lido_dvv_depositing_finish',
  ],
  [MATOMO_EARN_EVENTS_TYPES.dvvWithdrawTabClick]: [
    'Ethereum_Earn_Widget',
    'Click on Withdrawal tab on Lido DVV',
    'eth_earn_lido_dvv_withdrawal_tab',
  ],
  [MATOMO_EARN_EVENTS_TYPES.dvvWithdrawInputMaxClick]: [
    'Ethereum_Earn_Widget',
    'Click on "Max" in input on Withdrawal tab on Lido DVV',
    'eth_earn_lido_dvv_withdrawal_max',
  ],
  [MATOMO_EARN_EVENTS_TYPES.dvvWithdrawStart]: [
    'Ethereum_Earn_Widget',
    'Initiating withdrawal transaction on Lido DVV',
    'eth_earn_lido_dvv_withdrawal_start',
  ],
  [MATOMO_EARN_EVENTS_TYPES.dvvWithdrawFinish]: [
    'Ethereum_Earn_Widget',
    'Successful finish withdrawal transaction on Lido DVV',
    'eth_earn_lido_dvv_withdrawal_finish',
  ],
  [MATOMO_EARN_EVENTS_TYPES.dvvRewardsClaimSsv]: [
    'Ethereum_Earn_Widget',
    'Click on "Claim" on SSV rewards on Lido DVV',
    'eth_earn_lido_dvv_ssv_rewards_claim',
  ],
  [MATOMO_EARN_EVENTS_TYPES.dvvRewardsClaimObol]: [
    'Ethereum_Earn_Widget',
    'Click on "Claim" on Obol rewards on Lido DVV',
    'eth_earn_lido_dvv_obol_rewards_claim',
  ],
  [MATOMO_EARN_EVENTS_TYPES.dvvBackToAllVaults]: [
    'Ethereum_Earn_Widget',
    'Click on "Back to all vaults" on Lido DDV',
    'eth_earn_lido_dvv_back_to_all_vaults',
  ],
};
