import { MatomoEventType } from '@lidofinance/analytics-matomo';

export const enum MATOMO_CLICK_EVENTS_TYPES {
  // Global
  connectWallet = 'connectWallet',
  disconnectWalletManually = 'disconnectWalletManually',
  clickShowMoreWallets = 'clickShowMoreWallets',
  clickShowLessWallets = 'clickShowLessWallets',
  clickCurvePool = 'clickCurvePool',
  clickBalancerPool = 'clickBalancerPool',
  clickExploreDeFi = 'clickExploreDeFi',

  // Staking page
  openOceanDiscount = 'openOceanDiscount',
  oneInchDiscount = 'oneInchDiscount',
  viewEtherscanOnStakePage = 'viewEtherscanOnStakePage',
  lidoOnLidoMultichainOpportunities = 'lidoOnLidoMultichainOpportunities',
  vaultsBannerLearnMore = 'vaultsBannerLearnMore',
  obolBannerProceed = 'obolBannerProceed',
  obolBannerDVVLink = 'obolBannerDVVLink',
  startEarningGGV = 'startEarningGGV',
  vaultsBanner = 'vaultsBanner',

  // FAQ
  faqSafeWorkWithLidoAudits = 'faqSafeWorkWithLidoAudits',
  faqLidoEthAprEthLandingPage = 'faqLidoEthAprEthLandingPage',
  faqLidoEthAprDocs = 'faqLidoEthAprDocs',
  faqHowCanIGetStEthWidget = 'faqHowCanIGetStEthWidget',
  faqHowCanIGetStEthIntegrations = 'faqHowCanIGetStEthIntegrations',
  faqHowCanIGetStEthLedger = 'faqHowCanIGetStEthLedger',
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
  faqHowCanIUseWstethLidoMultichain = 'faqHowCanIUseWstethLidoMultichain',
  faqHowCanIUseWstethDefiProtocols = 'faqHowCanIUseWstethDefiProtocols',
  faqDoINeedToUnwrapMyWstethWithdrawalsTabs = 'faqDoINeedToUnwrapMyWstethWithdrawalsTabs',

  // Optimism
  faqHowCanIGetWstethOnOptimismWrapLink = 'faqHowCanIGetWstethOnOptimismWrapLink',
  faqHowCanIGetWstethOnOptimismBridgeYourWstETHFromEthereumToOptimism = 'faqHowCanIGetWstethOnOptimismBridgeYourWstETHFromEthereumToOptimism',
  faqHowCanIGetWstethOnOptimismIntegrations = 'faqHowCanIGetWstethOnOptimismIntegrations',
  faqHowCanIUseWstethOnOptimismDefiProtocols = 'faqHowCanIUseWstethOnOptimismDefiProtocols',
  faqHowCouldIUnwrapWstETHBackToStETHOnOptimismUnwrapLink = 'faqHowCouldIUnwrapWstETHBackToStETHOnOptimismUnwrapLink',
  faqWhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromOptimismBridgeYourWstETHOrStETHBack = 'faqWhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromOptimismBridgeYourWstETHOrStETHBack',
  faqWhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromOptimismWithdrawalsRequestAndClaim = 'faqWhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromOptimismWithdrawalsRequestAndClaim',

  // Soneium
  faqHowCanIGetWstethOnSoneiumWrapLink = 'faqHowCanIGetWstethOnSoneiumWrapLink',
  faqHowCanIGetWstethOnSoneiumBridgeYourWstETHFromEthereumToSoneium = 'faqHowCanIGetWstethOnSoneiumBridgeYourWstETHFromEthereumToSoneium',
  faqHowCanIGetWstethOnSoneiumIntegrations = 'faqHowCanIGetWstethOnSoneiumIntegrations',
  faqHowCanIUseWstethOnSoneiumDefiProtocols = 'faqHowCanIUseWstethOnSoneiumDefiProtocols',
  faqHowCouldIUnwrapWstETHBackToStETHOnSoneiumUnwrapLink = 'faqHowCouldIUnwrapWstETHBackToStETHOnSoneiumUnwrapLink',
  faqWhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromSoneiumBridgeYourWstETHOrStETHBack = 'faqWhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromSoneiumBridgeYourWstETHOrStETHBack',
  faqWhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromSoneiumWithdrawalsRequestAndClaim = 'faqWhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromSoneiumWithdrawalsRequestAndClaim',

  // Unichain
  faqHowCanIGetWstethOnUnichainWrapLink = 'faqHowCanIGetWstethOnUnichainWrapLink',
  faqHowCanIGetWstethOnUnichainBridgeYourWstETHFromEthereumToUnichain = 'faqHowCanIGetWstethOnUnichainBridgeYourWstETHFromEthereumToUnichain',
  faqHowCanIGetWstethOnUnichainIntegrations = 'faqHowCanIGetWstethOnUnichainIntegrations',
  faqHowCanIUseWstethOnUnichainDefiProtocols = 'faqHowCanIUseWstethOnUnichainDefiProtocols',
  faqHowCouldIUnwrapWstETHBackToStETHOnUnichainUnwrapLink = 'faqHowCouldIUnwrapWstETHBackToStETHOnUnichainUnwrapLink',
  faqWhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromUnichainBridgeYourWstETHOrStETHBack = 'faqWhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromUnichainBridgeYourWstETHOrStETHBack',
  faqWhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromUnichainWithdrawalsRequestAndClaim = 'faqWhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromUnichainWithdrawalsRequestAndClaim',

  // /wrap page
  wrapTokenSelectSTETH = 'wrapTokenSelectSteth',
  wrapTokenSelectETH = 'wrapTokenSelectEth',

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
  withdrawalGoToJumper = 'withdrawalGoToJumper',
  withdrawalEtherscanSuccessTemplate = 'withdrawalEtherscanSuccessTemplate',
  withdrawalGuideSuccessTemplate = 'withdrawalGuideSuccessTemplate',

  // /withdrawal/claim page
  claimViewOnEtherscanSuccessTemplate = 'claimViewOnEtherscanSuccessTemplate',

  // /withdrawal/request and /withdrawal/claim shared events
  withdrawalWhatAreStakingPenaltiesFAQ = 'withdrawalWhatAreStakingPenaltiesFAQ',
  withdrawalNFTGuideFAQ = 'withdrawalNFTGuideFAQ',

  // /rewards page
  rewardsExportCSV = 'rewardsExportCSV',
  rewardsHistoricalStethPriceCheck = 'rewardsHistoricalStethPriceCheck',
  rewardsHistoricalStethPriceUncheck = 'rewardsHistoricalStethPriceUncheck',
  rewardsIncludeTransfersCheck = 'rewardsIncludeTransfersCheck',
  rewardsIncludeTransfersUncheck = 'rewardsIncludeTransfersUncheck',
  rewardsHistoricalCurrencyUSD = 'rewardsHistoricalCurrencyUSD',
  rewardsHistoricalCurrencyEUR = 'rewardsHistoricalCurrencyEUR',
  rewardsHistoricalCurrencyGBP = 'rewardsHistoricalCurrencyGBP',
}

export const MATOMO_CLICK_EVENTS: Record<
  MATOMO_CLICK_EVENTS_TYPES,
  MatomoEventType
> = {
  // Global
  [MATOMO_CLICK_EVENTS_TYPES.connectWallet]: [
    'Ethereum_Staking_Widget_Selecting_wallet_to_connect',
    'Select wallet to connect in the list of wallets',
    'eth_widget_selecting_wallet_to_connect',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.disconnectWalletManually]: [
    'Ethereum_Staking_Widget',
    'Disconnect wallet manually',
    'eth_widget_disconnect_wallet',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.clickShowMoreWallets]: [
    'Ethereum_Staking_Widget',
    'Push "More wallets" on wallet modal',
    'eth_widget_more_wallets',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.clickShowLessWallets]: [
    'Ethereum_Staking_Widget',
    'Push "Less wallets" on wallet modal',
    'eth_widget_less_wallets',
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
  [MATOMO_CLICK_EVENTS_TYPES.lidoOnLidoMultichainOpportunities]: [
    'Ethereum_Staking_Widget',
    'Push "Lido on L2 opportunities" ', // L2 naiming for analytics history consistency
    'eth_widget_lido_on_l2_opportunities', // L2 naiming for analytics history consistency
  ],
  [MATOMO_CLICK_EVENTS_TYPES.vaultsBannerLearnMore]: [
    'Ethereum_Staking_Widget',
    'Click on "Learn more" on Vaults banner',
    'eth_widget_learn_more_vaults_banner',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.obolBannerProceed]: [
    'Ethereum_Staking_Widget',
    'Push "Proceed" Obol SSV',
    'eth_widget_proceed_obol_ssv',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.obolBannerDVVLink]: [
    'Ethereum_Staking_Widget',
    'Push "the DVV Vault" link on Obol SSV banner',
    'eth_widget_the_dvv_vault_link_obol_ssv',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.startEarningGGV]: [
    'Ethereum_Staking_Widget_After_Staking_CTA',
    'Click on the staking follow-up banner',
    'eth_widget_start_earning_ggv',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.vaultsBanner]: [
    'Ethereum_Staking_Widget',
    'Click on vault banner',
    'eth_widget_vaults_banner',
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
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetStEthLedger]: [
    'Ethereum_Staking_Widget',
    'Push «Ledger Ethereum wallet» in FAQ How can I get stETH? on stake widget',
    'eth_widget_faq_howCanIGetStEth_ledgerEthereumWallet',
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
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetWstethOnOptimismWrapLink]: [
    'Ethereum_Staking_Widget',
    'Push «Wrap & Unwrap staking widget» in FAQ How can I get wstETH (Optimism)',
    'eth_widget_faq_howgetwsteth_wrap_optimism',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetWstethOnSoneiumWrapLink]: [
    'Ethereum_Staking_Widget',
    'Push «Wrap & Unwrap staking widget» in FAQ How can I get wstETH (Soneium)',
    'eth_widget_faq_howgetwsteth_wrap_soneium',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetWstethOnUnichainWrapLink]: [
    'Ethereum_Staking_Widget',
    'Push «Wrap & Unwrap staking widget» in FAQ How can I get wstETH (Unichain)',
    'eth_widget_faq_howgetwsteth_wrap_unichain',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetWstethOnOptimismBridgeYourWstETHFromEthereumToOptimism]:
    [
      'Ethereum_Staking_Widget',
      'Push «bridge your wstETH from Ethereum to Optimism» in How can I get wstETH on Optimism?',
      'eth_widget_faq_howCanIGetWstethOnOptimism_bridgeYourWstETHFromEthereumToOptimism',
    ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetWstethOnSoneiumBridgeYourWstETHFromEthereumToSoneium]:
    [
      'Ethereum_Staking_Widget',
      'Push «bridge your wstETH from Ethereum to Soneium» in How can I get wstETH on Soneium?',
      'eth_widget_faq_howCanIGetWstethOnSoneium_bridgeYourWstETHFromEthereumToSoneium',
    ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetWstethOnUnichainBridgeYourWstETHFromEthereumToUnichain]:
    [
      'Ethereum_Staking_Widget',
      'Push «bridge your wstETH from Ethereum to Unichain in How can I get wstETH on Unichain?',
      'eth_widget_faq_howCanIGetWstethOnUnichain_bridgeYourWstETHFromEthereumToUnichain',
    ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetWstethOnOptimismIntegrations]: [
    'Ethereum_Staking_Widget',
    'Push «DEX Lido integrations» in FAQ How can I get wstETH (Optimism)',
    'eth_widget_faq_howgetwsteth_dexLidoIntegrations_optimism',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetWstethOnSoneiumIntegrations]: [
    'Ethereum_Staking_Widget',
    'Push «DEX Lido integrations» in FAQ How can I get wstETH (Soneium)',
    'eth_widget_faq_howgetwsteth_dexLidoIntegrations_soneium',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetWstethOnUnichainIntegrations]: [
    'Ethereum_Staking_Widget',
    'Push «DEX Lido integrations» in FAQ How can I get wstETH (Unichain)',
    'eth_widget_faq_howgetwsteth_dexLidoIntegrations_unichain',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowDoIUnwrapWstethUnwrapLink]: [
    'Ethereum_Staking_Widget',
    'Push «stake.lido.fi/wrap/unwrap» How do I unwrap wstETH back to stETH?',
    'eth_widget_faq_howunwrapwsteth_unwrap',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCanIUseWstethLidoMultichain]: [
    'Ethereum_Staking_Widget',
    'Push «L2» How can I use wstETH?', // L2 naiming for analytics history consistency
    'eth_widget_faq_howCanIUseWstETH_l2', // L2 naiming for analytics history consistency
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCanIUseWstethOnOptimismDefiProtocols]: [
    'Ethereum_Staking_Widget',
    'Push «L2» How can I use wstETH? (Optimism)',
    'eth_widget_faq_howCanIUseWstETH_l2_optimism',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCanIUseWstethOnSoneiumDefiProtocols]: [
    'Ethereum_Staking_Widget',
    'Push «L2» How can I use wstETH? (Soneium)',
    'eth_widget_faq_howCanIUseWstETH_l2_soneium',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCanIUseWstethOnUnichainDefiProtocols]: [
    'Ethereum_Staking_Widget',
    'Push «L2» How can I use wstETH? (Unichain)',
    'eth_widget_faq_howCanIUseWstETH_l2_unichain',
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
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCouldIUnwrapWstETHBackToStETHOnOptimismUnwrapLink]:
    [
      'Ethereum_Staking_Widget',
      'Push «Wrap & Unwrap staking widget» How could I unwrap wstETH back to stETH on Optimism?',
      'eth_widget_faq_howCouldIUnwrapWstETHBackToStETHOnOptimismUnwrapLink',
    ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCouldIUnwrapWstETHBackToStETHOnSoneiumUnwrapLink]:
    [
      'Ethereum_Staking_Widget',
      'Push «Wrap & Unwrap staking widget» How could I unwrap wstETH back to stETH on Soneium?',
      'eth_widget_faq_howCouldIUnwrapWstETHBackToStETHOnSoneiumUnwrapLink',
    ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCouldIUnwrapWstETHBackToStETHOnUnichainUnwrapLink]:
    [
      'Ethereum_Staking_Widget',
      'Push «Wrap & Unwrap staking widget» How could I unwrap wstETH back to stETH on Unichain?',
      'eth_widget_faq_howCouldIUnwrapWstETHBackToStETHOnUnichainUnwrapLink',
    ],
  [MATOMO_CLICK_EVENTS_TYPES.faqWhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromOptimismBridgeYourWstETHOrStETHBack]:
    [
      'Ethereum_Staking_Widget',
      'Push «bridge your wstETH or stETH back» What happens if I want to unstake ETH on Ethereum? Can I do that from Optimism?',
      'eth_widget_faq_WhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromOptimismBridgeYourWstETHOrStETHBack',
    ],
  [MATOMO_CLICK_EVENTS_TYPES.faqWhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromSoneiumBridgeYourWstETHOrStETHBack]:
    [
      'Ethereum_Staking_Widget',
      'Push «bridge your wstETH or stETH back» What happens if I want to unstake ETH on Ethereum? Can I do that from Soneium?',
      'eth_widget_faq_WhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromSoneiumBridgeYourWstETHOrStETHBack',
    ],
  [MATOMO_CLICK_EVENTS_TYPES.faqWhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromUnichainBridgeYourWstETHOrStETHBack]:
    [
      'Ethereum_Staking_Widget',
      'Push «bridge your wstETH or stETH back» What happens if I want to unstake ETH on Ethereum? Can I do that from Unichain?',
      'eth_widget_faq_WhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromUnichainBridgeYourWstETHOrStETHBack',
    ],
  [MATOMO_CLICK_EVENTS_TYPES.faqWhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromOptimismWithdrawalsRequestAndClaim]:
    [
      'Ethereum_Staking_Widget',
      'Push «Withdrawals Request and Claim» What happens if I want to unstake ETH on Ethereum? Can I do that from Optimism?',
      'eth_widget_faq_WhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromOptimismWithdrawalsRequestAndClaim',
    ],
  [MATOMO_CLICK_EVENTS_TYPES.faqWhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromSoneiumWithdrawalsRequestAndClaim]:
    [
      'Ethereum_Staking_Widget',
      'Push «Withdrawals Request and Claim» What happens if I want to unstake ETH on Ethereum? Can I do that from Soneium?',
      'eth_widget_faq_WhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromSoneiumWithdrawalsRequestAndClaim',
    ],
  [MATOMO_CLICK_EVENTS_TYPES.faqWhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromUnichainWithdrawalsRequestAndClaim]:
    [
      'Ethereum_Staking_Widget',
      'Push «Withdrawals Request and Claim» What happens if I want to unstake ETH on Ethereum? Can I do that from Unichain?',
      'eth_widget_faq_WhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromUnichainWithdrawalsRequestAndClaim',
    ],
  // /wrap page
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
    'Ethereum_Staking_Widget_Withdraw_Use_Aggregators',
    'Click on «Go to 1inch» in aggregators list on Request tab',
    'eth_withdrawals_request_go_to_1inch',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.withdrawalGoToBebop]: [
    'Ethereum_Staking_Widget_Withdraw_Use_Aggregators',
    'Click on «Go to Bebop» in aggregators list on Request tab',
    'eth_withdrawals_request_go_to_Bebop',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.withdrawalGoToCowSwap]: [
    'Ethereum_Staking_Widget_Withdraw_Use_Aggregators',
    'Click on «Go to CowSwap» in aggregators list on Request tab',
    'eth_withdrawals_request_go_to_CowSwap',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.withdrawalGoToParaswap]: [
    'Ethereum_Staking_Widget_Withdraw_Use_Aggregators',
    'Click on «Go to Paraswap» in aggregators list on Request tab',
    'eth_withdrawals_request_go_to_Paraswap',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.withdrawalGoToOpenOcean]: [
    'Ethereum_Staking_Widget_Withdraw_Use_Aggregators',
    'Click on «Go to OpenOcean in aggregators list on Request tab',
    'eth_withdrawals_request_go_to_OpenOcean',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.withdrawalGoToJumper]: [
    'Ethereum_Staking_Widget_Withdraw_Use_Aggregators',
    'Click on «Go to Jumper» in aggregators list on Request tab',
    'eth_withdrawals_request_go_to_Jumper',
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

  // /rewards page
  [MATOMO_CLICK_EVENTS_TYPES.rewardsExportCSV]: [
    'Ethereum_Rewards_Widget',
    'Click on "Export CSV"',
    'eth_rewards_export_csv',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.rewardsHistoricalStethPriceCheck]: [
    'Ethereum_Rewards_Widget',
    'Click check on "Historical stETH price" in check-box',
    'eth_historical_stETH_price_check_box_check',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.rewardsHistoricalStethPriceUncheck]: [
    'Ethereum_Rewards_Widget',
    'Click uncheck on "Historical stETH price" in check-box',
    'eth_historical_stETH_price_check_box_uncheck',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.rewardsIncludeTransfersCheck]: [
    'Ethereum_Rewards_Widget',
    'Click check on "Include transfers" in check-box',
    'eth_include_transfers_check_box_check',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.rewardsIncludeTransfersUncheck]: [
    'Ethereum_Rewards_Widget',
    'Click uncheck on "Include transfers" in check-box',
    'eth_include_transfers_check_box_uncheck',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.rewardsHistoricalCurrencyUSD]: [
    'Ethereum_Rewards_Widget',
    'Click on "USD" in currency choice',
    'eth_historical_usd_currency_choice',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.rewardsHistoricalCurrencyEUR]: [
    'Ethereum_Rewards_Widget',
    'Click on "EUR" in currency choice',
    'eth_historical_eur_currency_choice',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.rewardsHistoricalCurrencyGBP]: [
    'Ethereum_Rewards_Widget',
    'Click on "GBP" in currency choice',
    'eth_historical_gbp_currency_choice',
  ],
};
