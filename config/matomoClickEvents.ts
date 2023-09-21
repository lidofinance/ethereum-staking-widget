import { MatomoEventType } from '@lidofinance/analytics-matomo';

export const enum MATOMO_CLICK_EVENTS_TYPES {
  // Global
  connectWallet = 'connectWallet',
  clickCurvePool = 'clickCurvePool',
  clickBalancerPool = 'clickBalancerPool',
  clickExploreDeFi = 'clickExploreDeFi',
  // / page
  oneInchDiscount = 'oneInchDiscount',
  viewEtherscanOnStakePage = 'viewEtherscanOnStakePage',
  l2BannerStake = 'l2BannerStake',
  // /wrap page
  l2BannerWrap = 'l2BannerWrap',
  wrapTokenSelectSTETH = 'wrapTokenSelectSteth',
  wrapTokenSelectETH = 'wrapTokenSelectEth',
  // Unwrap tab
  l2BannerUnwrap = 'l2BannerUnwrap',
  // /rewards page
  calculateRewards = 'calculateRewards',

  // /withdrawal page
  withdrawalUseLido = 'withdrawalUseLido',
  withdrawalUseAggregators = 'withdrawalUseAggregators',
  withdrawalMaxInput = 'withdrawalMaxInput',
  withdrawalOtherFactorsTooltipMode = 'withdrawalOtherFactorsTooltipMode',
  withdrawalFAQtooltipEthAmount = 'withdrawalFAQtooltipEthAmount',
  withdrawalGoTo1inch = 'withdrawalGoTo1inch',
  withdrawalGoToCowSwap = 'withdrawalGoToCowSwap',
  withdrawalGoToParaswap = 'withdrawalGoToParaswap',
  withdrawalEtherscanSuccessTemplate = 'withdrawalEtherscanSuccessTemplate',
  withdrawalGuideSuccessTemplate = 'withdrawalGuideSuccessTemplate',

  // /withdrawal/claim page
  claimViewOnEtherscanSuccessTemplate = 'claimViewOnEtherscanSuccessTemplate',

  // /withdrawal/request and /withdrawal/claim shared events
  withdrawalWhatAreStakingPenaltiesFAQ = 'withdrawalWhatAreStakingPenaltiesFAQ',
  withdrawalNFTGuideFAQ = 'withdrawalNFTGuideFAQ',
}

export const MATOMO_CLICK_EVENTS: Record<
  MATOMO_CLICK_EVENTS_TYPES,
  MatomoEventType
> = {
  // Global
  [MATOMO_CLICK_EVENTS_TYPES.connectWallet]: [
    'Ethereum_Staking_Widget',
    'Push "Connect wallet" button',
    'eth_widget_connect_wallet',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.clickCurvePool]: [
    'Ethereum_Staking_Widget',
    'Push «Explore» in Curve section on Transaction success banner',
    'eth_widget_banner_curve_explore',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.clickBalancerPool]: [
    'Ethereum_Staking_Widget',
    'Push «Explore» in Balancer section on Transaction success banner',
    'eth_widget_banner_balancer_explore',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.clickExploreDeFi]: [
    'Ethereum_Staking_Widget',
    'Push «Explore more DeFi options» on Transaction success banner',
    'eth_widget_banner_defi_explore',
  ],
  // / page
  [MATOMO_CLICK_EVENTS_TYPES.oneInchDiscount]: [
    'Ethereum_Staking_Widget',
    'Push "Get discount" on 1inch banner on widget',
    'eth_widget_oneinch_discount',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.viewEtherscanOnStakePage]: [
    'Ethereum_Staking_Widget',
    'Push «View on Etherscan» on the right side of Lido Statistics',
    'eth_widget_etherscan_stakePage',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.l2BannerStake]: [
    'Ethereum_Staking_Widget',
    'Push "Learn more" at the L2 banner on "Stake" tab',
    'eth_widget_banner_l2_stake',
  ],
  // /wrap page
  [MATOMO_CLICK_EVENTS_TYPES.l2BannerWrap]: [
    'Ethereum_Staking_Widget',
    'Push "Learn more" at the L2 banner on "Wrap" tab',
    'eth_widget_banner_l2_wrap',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.wrapTokenSelectETH]: [
    'Ethereum_Staking_Widget',
    'Select ETH to wrap to wsteth on wrap page',
    'eth_widget_wrap_select_token_eth',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.wrapTokenSelectSTETH]: [
    'Ethereum_Staking_Widget',
    'Select STETH to wrap to wsteth on wrap page',
    'eth_widget_wrap_select_token_steth',
  ],
  // Unwrap tab
  [MATOMO_CLICK_EVENTS_TYPES.l2BannerUnwrap]: [
    'Ethereum_Staking_Widget',
    'Push "Learn more" at the L2 banner on "Unwrap" tab',
    'eth_widget_banner_l2_unwrap',
  ],
  // /rewards page
  [MATOMO_CLICK_EVENTS_TYPES.calculateRewards]: [
    'Ethereum_Staking_Widget',
    'Push calculate reward button" ',
    'eth_widget_calculate_reward',
  ],

  // /withdrawal page
  [MATOMO_CLICK_EVENTS_TYPES.withdrawalUseLido]: [
    'Ethereum_Withdrawals_Widget',
    'Click on «Use Lido» on Request tab',
    'eth_withdrawals_request_use_lido',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.withdrawalUseAggregators]: [
    'Ethereum_Withdrawals_Widget',
    'Click on «Use aggregators» on Request tab',
    'eth_withdrawals_request_use_aggregators',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.withdrawalMaxInput]: [
    'Ethereum_Withdrawals_Widget',
    'Click on "Max" in input on Request tab',
    'eth_withdrawals_request_max_input',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.withdrawalOtherFactorsTooltipMode]: [
    'Ethereum_Withdrawals_Widget',
    'Push «other factors in tooltip near Withdrawals mode on Request tab',
    'eth_withdrawals_request_other_reasons_tooltip_mode',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.withdrawalFAQtooltipEthAmount]: [
    'Ethereum_Withdrawals_Widget',
    'Push «FAQ» in tooltip near ETH amount on Request tab',
    'eth_withdrawals_request_FAQ_tooltip_eth_amount',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.withdrawalGoTo1inch]: [
    'Ethereum_Withdrawals_Widget',
    'Click on «Go to 1inch» in aggregators list on Request tab',
    'eth_withdrawals_request_go_to_1inch',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.withdrawalGoToCowSwap]: [
    'Ethereum_Withdrawals_Widget',
    'Click on «Go to CowSwap» in aggregators list on Request tab',
    'eth_withdrawals_request_go_to_CowSwap',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.withdrawalGoToParaswap]: [
    'Ethereum_Withdrawals_Widget',
    'Click on «Go to Paraswap» in aggregators list on Request tab',
    'eth_withdrawals_request_go_to_Paraswap',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.withdrawalEtherscanSuccessTemplate]: [
    'Ethereum_Withdrawals_Widget',
    'Click on "Etherscan" on success template after withdrawal request',
    'eth_withdrawals_request_etherscan_success_template',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.withdrawalGuideSuccessTemplate]: [
    'Ethereum_Withdrawals_Widget',
    'Click on "This guide will help you to do this" on success template after withdrawal request',
    'eth_withdrawals_request_guide_success_template',
  ],

  // /withdrawal?tab=claim page
  [MATOMO_CLICK_EVENTS_TYPES.claimViewOnEtherscanSuccessTemplate]: [
    'Ethereum_Withdrawals_Widget',
    'Click on "View on Etherscan" on success template after claim',
    'eth_withdrawals_claim_view_on_etherscan_success_template',
  ],

  // /withdrawal and /withdrawal?tab=claim shared events
  [MATOMO_CLICK_EVENTS_TYPES.withdrawalWhatAreStakingPenaltiesFAQ]: [
    'Ethereum_Withdrawals_Widget',
    'Push on "What Are Staking/Validator Penalties" in FAQ',
    'eth_withdrawals_what_are_staking_penalties_FAQ',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.withdrawalNFTGuideFAQ]: [
    'Ethereum_Withdrawals_Widget',
    'Push on "How do I add the Lido NFT to my wallet" guide link in FAQ',
    'eth_withdrawals_how_to_add_nft_guide_FAQ',
  ],
};
