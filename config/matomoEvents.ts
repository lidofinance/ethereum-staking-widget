import { MatomoEvent } from 'utils';

export const enum MATOMO_CLICK_EVENTS_TYPES {
  // Global
  connectWallet = 'connectWallet',
  // / page
  oneInchDiscount = 'oneInchDiscount',
  viewEtherscanOnStakePage = 'viewEtherscanOnStakePage',
  l2BannerStake = 'l2BannerStake',
  // FAQ
  faqWhatIsLidoScorecard = 'faqWhatIsLidoScorecard',
  faqWhatIsLidoLearnMore = 'faqWhatIsLidoLearnMore',
  faqLidoInsuranceFund = 'faqLidoInsuranceFund',
  faqLidoInsuranceFundRiskScenarios = 'faqLidoInsuranceFundRiskScenarios',
  faqWhereCanICoverBridgeMutual = 'faqWhereCanICoverBridgeMutual',
  faqWhereCanICoverIdleFinance = 'faqWhereCanICoverIdleFinance',
  faqWhereCanICoverNexusMutual = 'faqWhereCanICoverNexusMutual',
  faqWhereCanICoverRibbonFinance = 'faqWhereCanICoverRibbonFinance',
  faqRisksOfStakingReports = 'faqRisksOfStakingReports',
  faqRisksOfStakingImmunefiBugBounty = 'faqRisksOfStakingImmunefiBugBounty',
  faqStethConvertedToEthCurve = 'faqStethConvertedToEthCurve',
  faqStethConvertedToEthBalancer = 'faqStethConvertedToEthBalancer',
  faqHowCanIGetWstethWrapLink = 'faqHowCanIGetWstethWrapLink',
  faqHowDoIUnwrapWstethUnwrapLink = 'faqHowDoIUnwrapWstethUnwrapLink',
  // /wrap page
  l2BannerWrap = 'l2BannerWrap',
  // Unwrap tab
  l2BannerUnwrap = 'l2BannerUnwrap',
  // /rewards page
  calculateRewards = 'calculateRewards',
}

export const MATOMO_CLICK_EVENTS: Record<
  MATOMO_CLICK_EVENTS_TYPES,
  MatomoEvent
> = {
  // Global
  [MATOMO_CLICK_EVENTS_TYPES.connectWallet]: [
    'Ethereum_Staking_Widget',
    'Push "Connect wallet" button',
    'eth_widget_connect_wallet',
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
  // FAQ
  [MATOMO_CLICK_EVENTS_TYPES.faqWhatIsLidoScorecard]: [
    'Ethereum_Staking_Widget',
    'Push «Scorecard» in FAQ What is Lido on stake widget',
    'eth_widget_faq_whatislido_scorecard',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqWhatIsLidoLearnMore]: [
    'Ethereum_Staking_Widget',
    'Push «here» in FAQ What is Lido «Learn more here» on stake widget',
    'eth_widget_faq_whatislido_learnmore',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqLidoInsuranceFund]: [
    'Ethereum_Staking_Widget',
    'Push «Insurance fund» in FAQ What is the Lido Insurance Fund used for? on stake widget',
    'eth_widget_faq_lidoInsuranceFund_insurancefund',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqLidoInsuranceFundRiskScenarios]: [
    'Ethereum_Staking_Widget',
    'Push «here» in FAQ What is the Lido Insurance Fund used for? "risk scenarios" on stake widget',
    'eth_widget_faq_lidoInsuranceFund_insurancefund',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqWhereCanICoverBridgeMutual]: [
    'Ethereum_Staking_Widget',
    'Push «Bridge Mutual» in FAQ Where can I cover my stETH? on stake widget',
    'eth_widget_faq_wherecanicover_bridgemutual',
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
  [MATOMO_CLICK_EVENTS_TYPES.faqStethConvertedToEthCurve]: [
    'Ethereum_Staking_Widget',
    'Push «Curve» in FAQ How stETH can be converted to ETH on stake widget',
    'eth_widget_faq_stethconverttoeth_curve',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqStethConvertedToEthBalancer]: [
    'Ethereum_Staking_Widget',
    'Push «Balancer» in FAQ How stETH can be converted to ETH on stake widget',
    'eth_widget_faq_stethconverttoeth_balancer',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetWstethWrapLink]: [
    'Ethereum_Staking_Widget',
    'Push «stake.lido.fi/wrap.» in FAQ How can I get wstETH',
    'eth_widget_faq_howgetwsteth_wrap',
  ],
  [MATOMO_CLICK_EVENTS_TYPES.faqHowDoIUnwrapWstethUnwrapLink]: [
    'Ethereum_Staking_Widget',
    'Push «stake.lido.fi/wrap?mode=unwrap» How do I unwrap wstETH back to stETH?',
    'eth_widget_faq_howunwrapwsteth_unwrap',
  ],
  // /wrap page
  [MATOMO_CLICK_EVENTS_TYPES.l2BannerWrap]: [
    'Ethereum_Staking_Widget',
    'Push "Learn more" at the L2 banner on "Wrap" tab',
    'eth_widget_banner_l2_wrap',
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
};
