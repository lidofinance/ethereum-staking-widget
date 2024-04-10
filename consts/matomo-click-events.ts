import { MatomoEventType } from '@lidofinance/analytics-matomo';

export const enum MATOMO_CLICK_EVENTS_TYPES {
  // Global
  connectWallet = 'connectWallet',
  clickCurvePool = 'clickCurvePool',
  clickBalancerPool = 'clickBalancerPool',
  clickExploreDeFi = 'clickExploreDeFi',
  // / page
  openOceanDiscount = 'openOceanDiscount',
  oneInchDiscount = 'oneInchDiscount',
  viewEtherscanOnStakePage = 'viewEtherscanOnStakePage',
  l2BannerStake = 'l2BannerStake',
  l2LowFeeStake = 'l2LowFeeStake',
  l2LowFeeWrap = 'l2LowFeeWrap',
  l2swap = 'l2swap',
  // FAQ
  faqSafeWorkWithLidoAudits = 'faqSafeWorkWithLidoAudits',
  faqLidoEthAprEthLandingPage = 'faqLidoEthAprEthLandingPage',
  faqLidoEthAprDocs = 'faqLidoEthAprDocs',
  faqHowCanIGetStEthWidget = 'faqHowCanIGetStEthWidget',
  faqHowCanIGetStEthIntegrations = 'faqHowCanIGetStEthIntegrations',
  faqHowCanIUseSteth = 'faqHowCanIUseSteth',
  faqWhereCanICoverIdleFinance = 'faqWhereCanICoverIdleFinance',
  faqWhereCanICoverNexusMutual = 'faqWhereCanICoverNexusMutual',
  faqWhereCanICoverRibbonFinance = 'faqWhereCanICoverRibbonFinance',
  faqWhereCanICoverChainproof = 'faqWhereCanICoverChainproof',
  faqRisksOfStakingReports = 'faqRisksOfStakingReports',
  faqRisksOfStakingImmunefiBugBounty = 'faqRisksOfStakingImmunefiBugBounty',
  faqHowCanIUnstakeStEthWithdrawals = 'faqHowCanIUnstakeStEthWithdrawals',
  faqHowCanIUnstakeStEthIntegrations = 'faqHowCanIUnstakeStEthIntegrations',
  faqHowCanIGetWstethWrapLink = 'faqHowCanIGetWstethWrapLink',
  faqHowCanIGetWstethIntegrationsLink = 'faqHowCanIGetWstethIntegrationsLink',
  faqHowDoIUnwrapWstethUnwrapLink = 'faqHowDoIUnwrapWstethUnwrapLink',
  faqHowCanIUseWstethL2 = 'faqHowCanIUseWstethL2',
  faqHowCanIUseWstethDefiProtocols = 'faqHowCanIUseWstethDefiProtocols',
  faqDoINeedToUnwrapMyWstethWithdrawalsTabs = 'faqDoINeedToUnwrapMyWstethWithdrawalsTabs',
  // /wrap page
  l2BannerWrap = 'l2BannerWrap',
  wrapTokenSelectSTETH = 'wrapTokenSelectSteth',
  wrapTokenSelectETH = 'wrapTokenSelectEth',
  // Unwrap tab
  l2BannerUnwrap = 'l2BannerUnwrap',

  // /withdrawal page
  withdrawalUseLido = 'withdrawalUseLido',
  withdrawalUseAggregators = 'withdrawalUseAggregators',
  withdrawalMaxInput = 'withdrawalMaxInput',
  withdrawalOtherFactorsTooltipMode = 'withdrawalOtherFactorsTooltipMode',
  withdrawalFAQtooltipEthAmount = 'withdrawalFAQtooltipEthAmount',
  withdrawalGoTo1inch = 'withdrawalGoTo1inch',
  withdrawalGoToBebop = 'withdrawalGoToBebop',
  withdrawalGoToCowSwap = 'withdrawalGoToCowSwap',
  withdrawalGoToParaswap = 'withdrawalGoToParaswap',
  withdrawalGoToOpenOcean = 'withdrawalGoToOpenOcean',
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
  [MATOMO_CLICK_EVENTS_TYPES.openOceanDiscount]: [
    'Ethereum_Staking_Widget',
    'Push "Get discount" on OpenOcean banner on widget',
    'eth_widget_openocean_discount',
  ],
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
  [MATOMO_CLICK_EVENTS_TYPES.l2LowFeeStake]: [
    'Ethereum_Staking_Widget',
    'Push «Learn more» in Unlock Low-Fee transactions on L2 on Transaction success banner on "Stake" tab',
    'eth_widget_banner_learn_more_L2_stake',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.l2LowFeeWrap]: [
    'Ethereum_Staking_Widget',
    'Push «Learn more» in Unlock Low-Fee transactions on L2 on Transaction success banner on "Wrap" tab',
    'eth_widget_banner_learn_more_L2_wrap',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.l2swap]: [
    'Ethereum_Staking_Widget',
    'Push «Swap» in Swap ETH to wstETH on L2 banner on staking widget',
    'eth_widget_banner_swap_ETH_on_L2',
  ],
  // FAQ
  [MATOMO_CLICK_EVENTS_TYPES.faqSafeWorkWithLidoAudits]: [
    'Ethereum_Staking_Widget',
    'Push «here» in FAQ Is it safe to work with Lido',
    'eth_widget_faq_safeWorkWithLido_here',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqLidoEthAprEthLandingPage]: [
    'Ethereum_Staking_Widget',
    'Push «Ethereum landing page» in FAQ What is Lido staking APR for Ethereum? on stake widget',
    'eth_widget_faq_lidoEthApr_ethereumLandingPage',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqLidoEthAprDocs]: [
    'Ethereum_Staking_Widget',
    'Push «Docs» in FAQ What is Lido staking APR for Ethereum? on stake widget',
    'eth_widget_faq_lidoEthApr_docs',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetStEthWidget]: [
    'Ethereum_Staking_Widget',
    'Push «Lido Ethereum staking widget» in FAQ How can I get stETH? on stake widget',
    'eth_widget_faq_howCanIGetStEth_lidoEthereumStakingWidget',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetStEthIntegrations]: [
    'Ethereum_Staking_Widget',
    'Push «DEX Lido integrations» in FAQ How can I get stETH? on stake widget',
    'eth_widget_faq_howCanIGetStEth_dexLidoIntegrations',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCanIUseSteth]: [
    'Ethereum_Staking_Widget',
    'Push «more» in FAQ How can I use stETH? on stake widget',
    'eth_widget_faq_howCanIUseSteth_more',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqWhereCanICoverIdleFinance]: [
    'Ethereum_Staking_Widget',
    'Push «Idle Finance» in FAQ Where can I cover my stETH? on stake widget',
    'eth_widget_faq_wherecanicover_idlefinance',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqWhereCanICoverNexusMutual]: [
    'Ethereum_Staking_Widget',
    'Push «Nexus Mutual» in FAQ Where can I cover my stETH? on stake widget',
    'eth_widget_faq_wherecanicover_nexusmutual',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqWhereCanICoverRibbonFinance]: [
    'Ethereum_Staking_Widget',
    'Push «Ribbon Finance» in FAQ Where can I cover my stETH? on stake widget',
    'eth_widget_faq_wherecanicover_ribbonfinance',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqWhereCanICoverChainproof]: [
    'Ethereum_Staking_Widget',
    'Push «Chainproof» in FAQ Where can I cover my stETH? on stake widget',
    'eth_widget_faq_wherecanicover_сhainproof',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqRisksOfStakingReports]: [
    'Ethereum_Staking_Widget',
    'Push "here" in FAQ  What are the risks of staking with Lido? on stake widget',
    'eth_widget_faq_risksofstaking_reports',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqRisksOfStakingImmunefiBugBounty]: [
    'Ethereum_Staking_Widget',
    'Push "Immunefi bug bounty program" in FAQ  What are the risks of staking with Lido? on stake widget',
    'eth_widget_faq_risksofstaking_immunefibugbounty',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCanIUnstakeStEthWithdrawals]: [
    'Ethereum_Staking_Widget',
    'Push «Withdrawals Request and Claim tabs» in FAQ How can I unstake stETH? on stake widget',
    'eth_widget_faq_howCanIUnstakeStEth_withdrawalsRequestAndClaimTabs',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCanIUnstakeStEthIntegrations]: [
    'Ethereum_Staking_Widget',
    'Push «DEX Lido integrations» in FAQ How can I unstake stETH? on stake widget',
    'eth_widget_faq_howCanIUnstakeStEth_dexLidoIntegrations',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetWstethWrapLink]: [
    'Ethereum_Staking_Widget',
    'Push «Wrap & Unwrap staking widget» in FAQ How can I get wstETH',
    'eth_widget_faq_howgetwsteth_wrap',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetWstethIntegrationsLink]: [
    'Ethereum_Staking_Widget',
    'Push «DEX Lido integrations» in FAQ How can I get wstETH',
    'eth_widget_faq_howgetwsteth_dexLidoIntegrations',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowDoIUnwrapWstethUnwrapLink]: [
    'Ethereum_Staking_Widget',
    'Push «stake.lido.fi/wrap/unwrap» How do I unwrap wstETH back to stETH?',
    'eth_widget_faq_howunwrapwsteth_unwrap',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCanIUseWstethL2]: [
    'Ethereum_Staking_Widget',
    'Push «L2» How can I use wstETH?',
    'eth_widget_faq_howCanIUseWstETH_l2',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCanIUseWstethDefiProtocols]: [
    'Ethereum_Staking_Widget',
    'Push «DeFi protocols» How can I use wstETH?',
    'eth_widget_faq_howCanIUseWstETH_defiProtocols',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqDoINeedToUnwrapMyWstethWithdrawalsTabs]: [
    'Ethereum_Staking_Widget',
    'Push «Withdrawals Request and Claim tabs» Do I need to unwrap my wstETH before requesting withdrawals?',
    'eth_widget_faq_doINeedToUnwrapMyWsteth_withdrawalsRequestAndClaimTabs',
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
  [MATOMO_CLICK_EVENTS_TYPES.withdrawalGoToBebop]: [
    'Ethereum_Withdrawals_Widget',
    'Click on «Go to Bebop» in aggregators list on Request tab',
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
  [MATOMO_CLICK_EVENTS_TYPES.withdrawalGoToOpenOcean]: [
    'Ethereum_Withdrawals_Widget',
    'Click on «Go to OpenOcean in aggregators list on Request tab',
    'eth_withdrawals_request_go_to_OpenOcean',
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
