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
  ggvGoToLidoEarnEth = 'ggvGoToLidoEarnEth',

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
  dvvGoToLidoEarnEth = 'dvvGoToLidoEarnEth',

  // Strategy Deposit
  strategyDeposit = 'strategyDeposit',
  strategyDepositTab = 'strategyDepositTab',
  strategySelectTokenEth = 'strategySelectTokenEth',
  strategySelectTokenWeth = 'strategySelectTokenWeth',
  strategySelectTokenWsteth = 'strategySelectTokenWsteth',
  strategyDepositMax = 'strategyDepositMax',
  strategyDepositingStart = 'strategyDepositingStart',
  strategyDepositingFinish = 'strategyDepositingFinish',
  strategyDepositCancel = 'strategyDepositCancel',
  strategyDepositClaim = 'strategyDepositClaim',

  // Strategy Withdrawal
  strategyWithdrawalTab = 'strategyWithdrawalTab',
  strategyWithdrawalMax = 'strategyWithdrawalMax',
  strategyWithdrawalStart = 'strategyWithdrawalStart',
  strategyWithdrawalFinish = 'strategyWithdrawalFinish',
  strategyWithdrawalClaim = 'strategyWithdrawalClaim',
  strategyWithdrawalClaimAll = 'strategyWithdrawalClaimAll',

  // Strategy Common
  strategyBackToAllVaults = 'strategyBackToAllVaults',
  strategyGoToLidoEarnEth = 'strategyGoToLidoEarnEth',

  // Earn List (common list-level events)
  earnListHowLidoEarnWorks = 'earnListHowLidoEarnWorks',
  earnListEarnEthDeposit = 'earnListEarnEthDeposit',
  earnListEarnUsdDeposit = 'earnListEarnUsdDeposit',
  earnListEarnEthBannerUpgrade = 'earnListEarnEthBannerUpgrade',
  earnListEarnEthBannerLearnHowItWorks = 'earnListEarnEthBannerLearnHowItWorks',
  earnListWhatIsLidoEarnEthMellowDashboard = 'earnListWhatIsLidoEarnEthMellowDashboard',
  earnListWhatIsLidoEarnEthUpgradeNow = 'earnListWhatIsLidoEarnEthUpgradeNow',
  earnListWhatIsLidoEarnEthGetInTouch = 'earnListWhatIsLidoEarnEthGetInTouch',

  // Earn ETH Deposit
  earnEthDepositTab = 'earnEthDepositTab',
  earnEthSelectTokenEth = 'earnEthSelectTokenEth',
  earnEthSelectTokenWeth = 'earnEthSelectTokenWeth',
  earnEthSelectTokenWsteth = 'earnEthSelectTokenWsteth',
  earnEthSelectTokenSteth = 'earnEthSelectTokenSteth',
  earnEthDepositMax = 'earnEthDepositMax',
  earnEthDepositingStart = 'earnEthDepositingStart',
  earnEthDepositingFinish = 'earnEthDepositingFinish',
  earnEthDepositCancel = 'earnEthDepositCancel',
  earnEthDepositClaim = 'earnEthDepositClaim',

  // Earn ETH Withdrawal
  earnEthWithdrawalTab = 'earnEthWithdrawalTab',
  earnEthWithdrawalMax = 'earnEthWithdrawalMax',
  earnEthWithdrawalStart = 'earnEthWithdrawalStart',
  earnEthWithdrawalFinish = 'earnEthWithdrawalFinish',
  earnEthWithdrawalCancel = 'earnEthWithdrawalCancel',
  earnEthWithdrawalClaim = 'earnEthWithdrawalClaim',
  earnEthWithdrawalClaimAll = 'earnEthWithdrawalClaimAll',

  // Earn ETH Common
  earnEthGgTokenUpgrade = 'earnEthGgTokenUpgrade',
  earnEthStrethTokenUpgrade = 'earnEthStrethTokenUpgrade',
  earnEthDvstethTokenUpgrade = 'earnEthDvstethTokenUpgrade',
  earnEthPerformance = 'earnEthPerformance',
  earnEthPerformanceTvlTab = 'earnEthPerformanceTvlTab',
  earnEthPerformanceTvl1m = 'earnEthPerformanceTvl1m',
  earnEthPerformanceTvl3m = 'earnEthPerformanceTvl3m',
  earnEthPerformanceApyTab = 'earnEthPerformanceApyTab',
  earnEthPerformanceApy1m = 'earnEthPerformanceApy1m',
  earnEthPerformanceApy3m = 'earnEthPerformanceApy3m',
  earnEthStrategy = 'earnEthStrategy',
  earnEthFaq = 'earnEthFaq',

  // Earn USD Deposit
  earnUsdDepositTab = 'earnUsdDepositTab',
  earnUsdSelectTokenUsdc = 'earnUsdSelectTokenUsdc',
  earnUsdSelectTokenUsdt = 'earnUsdSelectTokenUsdt',
  earnUsdDepositMax = 'earnUsdDepositMax',
  earnUsdDepositingStart = 'earnUsdDepositingStart',
  earnUsdDepositingFinish = 'earnUsdDepositingFinish',
  earnUsdDepositCancel = 'earnUsdDepositCancel',
  earnUsdDepositClaim = 'earnUsdDepositClaim',

  // Earn USD Withdrawal
  earnUsdWithdrawalTab = 'earnUsdWithdrawalTab',
  earnUsdWithdrawalMax = 'earnUsdWithdrawalMax',
  earnUsdWithdrawalStart = 'earnUsdWithdrawalStart',
  earnUsdWithdrawalFinish = 'earnUsdWithdrawalFinish',
  earnUsdWithdrawalCancel = 'earnUsdWithdrawalCancel',
  earnUsdWithdrawalClaim = 'earnUsdWithdrawalClaim',
  earnUsdWithdrawalClaimAll = 'earnUsdWithdrawalClaimAll',

  // Earn USD Common
  earnUsdPerformance = 'earnUsdPerformance',
  earnUsdPerformanceTvlTab = 'earnUsdPerformanceTvlTab',
  earnUsdPerformanceTvl1m = 'earnUsdPerformanceTvl1m',
  earnUsdPerformanceTvl3m = 'earnUsdPerformanceTvl3m',
  earnUsdPerformanceApyTab = 'earnUsdPerformanceApyTab',
  earnUsdPerformanceApy1m = 'earnUsdPerformanceApy1m',
  earnUsdPerformanceApy3m = 'earnUsdPerformanceApy3m',
  earnUsdStrategy = 'earnUsdStrategy',
  earnUsdFaq = 'earnUsdFaq',
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
  [MATOMO_EARN_EVENTS_TYPES.ggvGoToLidoEarnEth]: [
    'Ethereum_Earn_Widget',
    'Click on "Go to Lido Earn ETH" on Lido GGV',
    'eth_earn_lido_ggv_go_to_lido_earn_eth',
  ],
  [MATOMO_EARN_EVENTS_TYPES.dvvDeposit]: [
    'Ethereum_Earn_Widget',
    'Click "Deposit" on Lido DVV on the list of vaults',
    'eth_earn_list_lido_dvv_deposit',
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
    'Click on "Back to all vaults" on Lido DVV',
    'eth_earn_lido_dvv_back_to_all_vaults',
  ],
  [MATOMO_EARN_EVENTS_TYPES.dvvGoToLidoEarnEth]: [
    'Ethereum_Earn_Widget',
    'Click on "Go to Lido Earn ETH" on Lido DVV',
    'eth_earn_lido_dvv_go_to_lido_earn_eth',
  ],
  [MATOMO_EARN_EVENTS_TYPES.strategyBackToAllVaults]: [
    'Ethereum_Earn_Widget',
    'Click on "Back to all vaults" on Lido stRATEGY',
    'eth_earn_lido_strategy_back_to_all_vaults',
  ],
  [MATOMO_EARN_EVENTS_TYPES.strategyGoToLidoEarnEth]: [
    'Ethereum_Earn_Widget',
    'Click on "Go to Lido Earn ETH" on Lido stRATEGY',
    'eth_earn_lido_strategy_go_to_lido_earn_eth',
  ],
  [MATOMO_EARN_EVENTS_TYPES.strategyDeposit]: [
    'Ethereum_Earn_Widget',
    'Click "Deposit" on Lido stRATEGY on the list of vaults',
    'eth_earn_list_lido_strategy_deposit',
  ],
  [MATOMO_EARN_EVENTS_TYPES.strategyDepositTab]: [
    'Ethereum_Earn_Widget',
    'Click on Deposit tab on Lido stRATEGY',
    'eth_earn_lido_strategy_deposit_tab',
  ],
  [MATOMO_EARN_EVENTS_TYPES.strategySelectTokenEth]: [
    'Ethereum_Earn_Widget',
    'Select ETH to deposit on Lido stRATEGY',
    'eth_earn_lido_strategy_select_token_eth',
  ],
  [MATOMO_EARN_EVENTS_TYPES.strategySelectTokenWeth]: [
    'Ethereum_Earn_Widget',
    'Select WETH to deposit on Lido stRATEGY',
    'eth_earn_lido_strategy_select_token_weth',
  ],
  [MATOMO_EARN_EVENTS_TYPES.strategySelectTokenWsteth]: [
    'Ethereum_Earn_Widget',
    'Select wstETH to deposit on Lido stRATEGY',
    'eth_earn_lido_strategy_select_token_wsteth',
  ],
  [MATOMO_EARN_EVENTS_TYPES.strategyDepositMax]: [
    'Ethereum_Earn_Widget',
    'Click on "Max" in input on Deposit tab on Lido stRATEGY',
    'eth_earn_lido_strategy_deposit_max',
  ],
  [MATOMO_EARN_EVENTS_TYPES.strategyDepositingStart]: [
    'Ethereum_Earn_Widget',
    'Initiating depositing transaction on Lido stRATEGY',
    'eth_earn_lido_strategy_depositing_start',
  ],
  [MATOMO_EARN_EVENTS_TYPES.strategyDepositingFinish]: [
    'Ethereum_Earn_Widget',
    'Successful finish depositing transaction on Lido stRATEGY',
    'eth_earn_lido_strategy_depositing_finish',
  ],
  [MATOMO_EARN_EVENTS_TYPES.strategyDepositCancel]: [
    'Ethereum_Earn_Widget',
    'Click on "Cancel" deposit tab on Lido stRATEGY',
    'eth_earn_lido_strategy_deposit_cancel',
  ],
  [MATOMO_EARN_EVENTS_TYPES.strategyDepositClaim]: [
    'Ethereum_Earn_Widget',
    'Click on "Claim" deposit tab on Lido stRATEGY',
    'eth_earn_lido_strategy_deposit_claim',
  ],
  [MATOMO_EARN_EVENTS_TYPES.strategyWithdrawalTab]: [
    'Ethereum_Earn_Widget',
    'Click on Withdrawal tab on Lido stRATEGY',
    'eth_earn_lido_strategy_withdrawal_tab',
  ],
  [MATOMO_EARN_EVENTS_TYPES.strategyWithdrawalMax]: [
    'Ethereum_Earn_Widget',
    'Click on "Max" in input on Withdrawal tab on Lido stRATEGY',
    'eth_earn_lido_strategy_withdrawal_max',
  ],
  [MATOMO_EARN_EVENTS_TYPES.strategyWithdrawalStart]: [
    'Ethereum_Earn_Widget',
    'Initiating withdrawal transaction on Lido stRATEGY',
    'eth_earn_lido_strategy_withdrawal_start',
  ],
  [MATOMO_EARN_EVENTS_TYPES.strategyWithdrawalFinish]: [
    'Ethereum_Earn_Widget',
    'Successful finish withdrawal transaction on Lido stRATEGY',
    'eth_earn_lido_strategy_withdrawal_finish',
  ],
  [MATOMO_EARN_EVENTS_TYPES.strategyWithdrawalClaim]: [
    'Ethereum_Earn_Widget',
    'Click on "Claim" withdrawal tab on Lido stRATEGY',
    'eth_earn_lido_strategy_withdrawal_claim',
  ],
  [MATOMO_EARN_EVENTS_TYPES.strategyWithdrawalClaimAll]: [
    'Ethereum_Earn_Widget',
    'Click on "Claim all" withdrawal tab on Lido stRATEGY',
    'eth_earn_lido_strategy_withdrawal_claim_all',
  ],

  // Earn List (common list-level events)
  [MATOMO_EARN_EVENTS_TYPES.earnListHowLidoEarnWorks]: [
    'Ethereum_Earn_Widget',
    'Click "How Lido Earn Works"',
    'eth_earn_list_how_lido_earn_works',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnListEarnEthDeposit]: [
    'Ethereum_Earn_Widget',
    'Click "Deposit" on Lido Earn ETH on the list of vaults',
    'eth_earn_list_lido_earn_eth_deposit',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnListEarnUsdDeposit]: [
    'Ethereum_Earn_Widget',
    'Click "Deposit" on Lido Earn USD on the list of vaults',
    'eth_earn_list_lido_earn_usd_deposit',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnListEarnEthBannerUpgrade]: [
    'Ethereum_Earn_Widget',
    'Click "Upgrade" on Lido Earn ETH banner',
    'eth_earn_list_lido_earn_eth_banner_upgrade',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnListEarnEthBannerLearnHowItWorks]: [
    'Ethereum_Earn_Widget',
    'Click "Learn how it works" on Lido Earn ETH banner',
    'eth_earn_list_lido_earn_eth_banner_learn_how_it_works',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnListWhatIsLidoEarnEthMellowDashboard]: [
    'Ethereum_Earn_Widget',
    'Click "Mellow Dashboard" on What is Lido Earn ETH',
    'eth_earn_list_what_is_lido_earn_eth_mellow_dashboard',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnListWhatIsLidoEarnEthUpgradeNow]: [
    'Ethereum_Earn_Widget',
    'Click "Upgrade now" on What is Lido Earn ETH',
    'eth_earn_list_what_is_lido_earn_eth_upgrade_now',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnListWhatIsLidoEarnEthGetInTouch]: [
    'Ethereum_Earn_Widget',
    'Click "Get in touch" on What is Lido Earn ETH',
    'eth_earn_list_what_is_lido_earn_eth_get_in_touch',
  ],

  // Earn ETH Deposit
  [MATOMO_EARN_EVENTS_TYPES.earnEthDepositTab]: [
    'Ethereum_Earn_Widget',
    'Click on Deposit tab on Lido Earn ETH',
    'eth_earn_lido_earn_eth_deposit_tab',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnEthSelectTokenEth]: [
    'Ethereum_Earn_Widget',
    'Select ETH to deposit on Lido Earn ETH',
    'eth_earn_lido_earn_eth_select_token_eth',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnEthSelectTokenWeth]: [
    'Ethereum_Earn_Widget',
    'Select WETH to deposit on Lido Earn ETH',
    'eth_earn_lido_earn_eth_select_token_weth',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnEthSelectTokenWsteth]: [
    'Ethereum_Earn_Widget',
    'Select wstETH to deposit on Lido Earn ETH',
    'eth_earn_lido_earn_eth_select_token_wsteth',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnEthSelectTokenSteth]: [
    'Ethereum_Earn_Widget',
    'Select stETH to deposit on Lido Earn ETH',
    'eth_earn_lido_earn_eth_select_token_steth',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnEthDepositMax]: [
    'Ethereum_Earn_Widget',
    'Click on "Max" in input on Deposit tab on Lido Earn ETH',
    'eth_earn_lido_earn_eth_deposit_max',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnEthDepositingStart]: [
    'Ethereum_Earn_Widget',
    'Initiating depositing transaction on Lido Earn ETH',
    'eth_earn_lido_earn_eth_depositing_start',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnEthDepositingFinish]: [
    'Ethereum_Earn_Widget',
    'Successful finish depositing transaction on Lido Earn ETH',
    'eth_earn_lido_earn_eth_depositing_finish',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnEthDepositCancel]: [
    'Ethereum_Earn_Widget',
    'Click on "Cancel" deposit tab on Lido Earn ETH',
    'eth_earn_lido_earn_eth_deposit_cancel',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnEthDepositClaim]: [
    'Ethereum_Earn_Widget',
    'Click on "Claim" deposit tab on Lido Earn ETH',
    'eth_earn_lido_earn_eth_deposit_claim',
  ],

  // Earn ETH Withdrawal
  [MATOMO_EARN_EVENTS_TYPES.earnEthWithdrawalTab]: [
    'Ethereum_Earn_Widget',
    'Click on Withdrawal tab on Lido Earn ETH',
    'eth_earn_lido_earn_eth_withdrawal_tab',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnEthWithdrawalMax]: [
    'Ethereum_Earn_Widget',
    'Click on "Max" in input on Withdrawal tab on Lido Earn ETH',
    'eth_earn_lido_earn_eth_withdrawal_max',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnEthWithdrawalStart]: [
    'Ethereum_Earn_Widget',
    'Initiating withdrawal transaction on Lido Earn ETH',
    'eth_earn_lido_earn_eth_withdrawal_start',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnEthWithdrawalFinish]: [
    'Ethereum_Earn_Widget',
    'Successful finish withdrawal transaction on Lido Earn ETH',
    'eth_earn_lido_earn_eth_withdrawal_finish',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnEthWithdrawalCancel]: [
    'Ethereum_Earn_Widget',
    'Click on "Cancel" withdrawal tab on Lido Earn ETH',
    'eth_earn_lido_earn_eth_withdrawal_cancel',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnEthWithdrawalClaim]: [
    'Ethereum_Earn_Widget',
    'Click on "Claim" withdrawal tab on Lido Earn ETH',
    'eth_earn_lido_earn_eth_withdrawal_claim',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnEthWithdrawalClaimAll]: [
    'Ethereum_Earn_Widget',
    'Click on "Claim all" withdrawal tab on Lido Earn ETH',
    'eth_earn_lido_earn_eth_withdrawal_claim_all',
  ],

  // Earn ETH Common
  [MATOMO_EARN_EVENTS_TYPES.earnEthGgTokenUpgrade]: [
    'Ethereum_Earn_Widget',
    'Click on "Upgrade" for GG token on Lido Earn ETH',
    'eth_earn_lido_earn_eth_gg_token_upgrade',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnEthStrethTokenUpgrade]: [
    'Ethereum_Earn_Widget',
    'Click on "Upgrade" for strETH token on Lido Earn ETH',
    'eth_earn_lido_earn_eth_streth_token_upgrade',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnEthDvstethTokenUpgrade]: [
    'Ethereum_Earn_Widget',
    'Click on "Upgrade" for DVstETH token on Lido Earn ETH',
    'eth_earn_lido_earn_eth_dvsteth_token_upgrade',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnEthPerformance]: [
    'Ethereum_Earn_Widget',
    'Click on "Performance" page on Lido Earn ETH',
    'eth_earn_lido_earn_eth_performance',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnEthPerformanceTvlTab]: [
    'Ethereum_Earn_Widget',
    'Click on TVL tab on Performance page on Lido Earn ETH',
    'eth_earn_lido_earn_eth_performance_tvl_tab',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnEthPerformanceTvl1m]: [
    'Ethereum_Earn_Widget',
    'Click on 1m TVL on Performance page on Lido Earn ETH',
    'eth_earn_lido_earn_eth_performance_tvl_1m',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnEthPerformanceTvl3m]: [
    'Ethereum_Earn_Widget',
    'Click on 3m TVL on Performance page on Lido Earn ETH',
    'eth_earn_lido_earn_eth_performance_tvl_3m',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnEthPerformanceApyTab]: [
    'Ethereum_Earn_Widget',
    'Click on APY tab on Performance page on Lido Earn ETH',
    'eth_earn_lido_earn_eth_performance_apy_tab',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnEthPerformanceApy1m]: [
    'Ethereum_Earn_Widget',
    'Click on 1m APY on Performance page on Lido Earn ETH',
    'eth_earn_lido_earn_eth_performance_apy_1m',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnEthPerformanceApy3m]: [
    'Ethereum_Earn_Widget',
    'Click on 3m APY on Performance page on Lido Earn ETH',
    'eth_earn_lido_earn_eth_performance_apy_3m',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnEthStrategy]: [
    'Ethereum_Earn_Widget',
    'Click on "Strategy" page on Lido Earn ETH',
    'eth_earn_lido_earn_eth_strategy',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnEthFaq]: [
    'Ethereum_Earn_Widget',
    'Click on "FAQ" page on Lido Earn ETH',
    'eth_earn_lido_earn_eth_faq',
  ],

  // Earn USD Deposit
  [MATOMO_EARN_EVENTS_TYPES.earnUsdDepositTab]: [
    'Ethereum_Earn_Widget',
    'Click on Deposit tab on Lido Earn USD',
    'eth_earn_lido_earn_usd_deposit_tab',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnUsdSelectTokenUsdc]: [
    'Ethereum_Earn_Widget',
    'Select USDC to deposit on Lido Earn USD',
    'eth_earn_lido_earn_usd_select_token_usdc',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnUsdSelectTokenUsdt]: [
    'Ethereum_Earn_Widget',
    'Select USDT to deposit on Lido Earn USD',
    'eth_earn_lido_earn_usd_select_token_usdt',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnUsdDepositMax]: [
    'Ethereum_Earn_Widget',
    'Click on "Max" in input on Deposit tab on Lido Earn USD',
    'eth_earn_lido_earn_usd_deposit_max',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnUsdDepositingStart]: [
    'Ethereum_Earn_Widget',
    'Initiating depositing transaction on Lido Earn USD',
    'eth_earn_lido_earn_usd_depositing_start',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnUsdDepositingFinish]: [
    'Ethereum_Earn_Widget',
    'Successful finish depositing transaction on Lido Earn USD',
    'eth_earn_lido_earn_usd_depositing_finish',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnUsdDepositCancel]: [
    'Ethereum_Earn_Widget',
    'Click on "Cancel" deposit tab on Lido Earn USD',
    'eth_earn_lido_earn_usd_deposit_cancel',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnUsdDepositClaim]: [
    'Ethereum_Earn_Widget',
    'Click on "Claim" deposit tab on Lido Earn USD',
    'eth_earn_lido_earn_usd_deposit_claim',
  ],

  // Earn USD Withdrawal
  [MATOMO_EARN_EVENTS_TYPES.earnUsdWithdrawalTab]: [
    'Ethereum_Earn_Widget',
    'Click on Withdrawal tab on Lido Earn USD',
    'eth_earn_lido_earn_usd_withdrawal_tab',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnUsdWithdrawalMax]: [
    'Ethereum_Earn_Widget',
    'Click on "Max" in input on Withdrawal tab on Lido Earn USD',
    'eth_earn_lido_earn_usd_withdrawal_max',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnUsdWithdrawalStart]: [
    'Ethereum_Earn_Widget',
    'Initiating withdrawal transaction on Lido Earn USD',
    'eth_earn_lido_earn_usd_withdrawal_start',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnUsdWithdrawalFinish]: [
    'Ethereum_Earn_Widget',
    'Successful finish withdrawal transaction on Lido Earn USD',
    'eth_earn_lido_earn_usd_withdrawal_finish',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnUsdWithdrawalCancel]: [
    'Ethereum_Earn_Widget',
    'Click on "Cancel" withdrawal tab on Lido Earn USD',
    'eth_earn_lido_earn_usd_withdrawal_cancel',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnUsdWithdrawalClaim]: [
    'Ethereum_Earn_Widget',
    'Click on "Claim" withdrawal tab on Lido Earn USD',
    'eth_earn_lido_earn_usd_withdrawal_claim',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnUsdWithdrawalClaimAll]: [
    'Ethereum_Earn_Widget',
    'Click on "Claim all" withdrawal tab on Lido Earn USD',
    'eth_earn_lido_earn_usd_withdrawal_claim_all',
  ],

  // Earn USD Common
  [MATOMO_EARN_EVENTS_TYPES.earnUsdPerformance]: [
    'Ethereum_Earn_Widget',
    'Click on "Performance" page on Lido Earn USD',
    'eth_earn_lido_earn_usd_performance',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnUsdPerformanceTvlTab]: [
    'Ethereum_Earn_Widget',
    'Click on TVL tab on Performance page on Lido Earn USD',
    'eth_earn_lido_earn_usd_performance_tvl_tab',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnUsdPerformanceTvl1m]: [
    'Ethereum_Earn_Widget',
    'Click on 1m TVL on Performance page on Lido Earn USD',
    'eth_earn_lido_earn_usd_performance_tvl_1m',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnUsdPerformanceTvl3m]: [
    'Ethereum_Earn_Widget',
    'Click on 3m TVL on Performance page on Lido Earn USD',
    'eth_earn_lido_earn_usd_performance_tvl_3m',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnUsdPerformanceApyTab]: [
    'Ethereum_Earn_Widget',
    'Click on APY tab on Performance page on Lido Earn USD',
    'eth_earn_lido_earn_usd_performance_apy_tab',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnUsdPerformanceApy1m]: [
    'Ethereum_Earn_Widget',
    'Click on 1m APY on Performance page on Lido Earn USD',
    'eth_earn_lido_earn_usd_performance_apy_1m',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnUsdPerformanceApy3m]: [
    'Ethereum_Earn_Widget',
    'Click on 3m APY on Performance page on Lido Earn USD',
    'eth_earn_lido_earn_usd_performance_apy_3m',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnUsdStrategy]: [
    'Ethereum_Earn_Widget',
    'Click on "Strategy" page on Lido Earn USD',
    'eth_earn_lido_earn_usd_strategy',
  ],
  [MATOMO_EARN_EVENTS_TYPES.earnUsdFaq]: [
    'Ethereum_Earn_Widget',
    'Click on "FAQ" page on Lido Earn USD',
    'eth_earn_lido_earn_usd_faq',
  ],
};
