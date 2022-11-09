import { MatomoEvent } from 'utils';

export const enum MATOMO_EVENTS_TYPES {
  // Global
  connectWallet = 'connectWallet',
  // / page
  clickOneInchDiscount = 'clickOneInchDiscount',
  clickViewEtherscanOnStakePage = 'clickViewEtherscanOnStakePage',
  clickL2BannerStake = 'clickL2BannerStake',
  // FAQ
  clickFaqWhatIsLidoScorecard = 'clickFaqWhatIsLidoScorecard',
  clickFaqWhatIsLidoLearnMore = 'clickFaqWhatIsLidoLearnMore',
  clickFaqLidoInsuranceFund = 'clickFaqLidoInsuranceFund',
  clickFaqLidoInsuranceFundRiskScenarios = 'clickFaqLidoInsuranceFundRiskScenarios',
  clickFaqWhereCanICoverBridgeMutual = 'clickFaqWhereCanICoverBridgeMutual',
  clickFaqWhereCanICoverIdleFinance = 'clickFaqWhereCanICoverIdleFinance',
  clickFaqWhereCanICoverNexusMutual = 'clickFaqWhereCanICoverNexusMutual',
  clickFaqWhereCanICoverRibbonFinance = 'clickFaqWhereCanICoverRibbonFinance',
  clickFaqRisksOfStakingReports = 'clickFaqRisksOfStakingReports',
  clickFaqRisksOfStakingImmunefiBugBounty = 'clickFaqRisksOfStakingImmunefiBugBounty',
  clickFaqStethConvertedToEthCurve = 'clickFaqStethConvertedToEthCurve',
  clickFaqStethConvertedToEthBalancer = 'clickFaqStethConvertedToEthBalancer',
  // /wrap page
  clickL2BannerWrap = 'clickL2BannerWrap',
  // Unwrap tab
  clickL2BannerUnwrap = 'clickL2BannerUnwrap',
  // /rewards page
  calculateRewards = 'calculateRewards',
}

export const MATOMO_EVENTS: Record<MATOMO_EVENTS_TYPES, MatomoEvent> = {
  // Global
  [MATOMO_EVENTS_TYPES.connectWallet]: [
    'Ethereum_Staking_Widget',
    'Push "Connect wallet" button',
    'eth_widget_connect_wallet',
  ],
  // / page
  [MATOMO_EVENTS_TYPES.clickOneInchDiscount]: [
    'Ethereum_Staking_Widget',
    'Push "Get discount" on 1inch banner on widget',
    'eth_widget_oneinch_discount',
  ],
  [MATOMO_EVENTS_TYPES.clickViewEtherscanOnStakePage]: [
    'Ethereum_Staking_Widget',
    'Push «View on Etherscan» on the right side of Lido Statistics',
    'eth_widget_etherscan_stakePage',
  ],
  [MATOMO_EVENTS_TYPES.clickL2BannerStake]: [
    'Ethereum_Staking_Widget',
    'Push "Learn more" at the L2 banner on "Stake" tab',
    'eth_widget_banner_l2_stake',
  ],
  // FAQ
  // TODO: think - how to add event to md file
  [MATOMO_EVENTS_TYPES.clickFaqWhatIsLidoScorecard]: [
    'Ethereum_Staking_Widget',
    'Push «Scorecard» in FAQ What is Lido on stake widget',
    'eth_widget_faq_whatislido_scorecard',
  ],
  [MATOMO_EVENTS_TYPES.clickFaqWhatIsLidoLearnMore]: [
    'Ethereum_Staking_Widget',
    'Push «here» in FAQ What is Lido «Learn more here» on stake widget',
    'eth_widget_faq_whatislido_learnmore',
  ],
  [MATOMO_EVENTS_TYPES.clickFaqLidoInsuranceFund]: [
    'Ethereum_Staking_Widget',
    'Push «Insurance fund» in FAQ What is the Lido Insurance Fund used for? on stake widget',
    'eth_widget_faq_lidoInsuranceFund_insurancefund',
  ],
  [MATOMO_EVENTS_TYPES.clickFaqLidoInsuranceFundRiskScenarios]: [
    'Ethereum_Staking_Widget',
    'Push «here» in FAQ What is the Lido Insurance Fund used for? "risk scenarios" on stake widget',
    'eth_widget_faq_lidoInsuranceFund_insurancefund',
  ],
  [MATOMO_EVENTS_TYPES.clickFaqWhereCanICoverBridgeMutual]: [
    'Ethereum_Staking_Widget',
    'Push «Bridge Mutual» in FAQ Where can I cover my stETH? on stake widget',
    'eth_widget_faq_wherecanicover_bridgemutual',
  ],
  [MATOMO_EVENTS_TYPES.clickFaqWhereCanICoverIdleFinance]: [
    'Ethereum_Staking_Widget',
    'Push «Idle Finance» in FAQ Where can I cover my stETH? on stake widget',
    'eth_widget_faq_wherecanicover_idlefinance',
  ],
  [MATOMO_EVENTS_TYPES.clickFaqWhereCanICoverNexusMutual]: [
    'Ethereum_Staking_Widget',
    'Push «Nexus Mutual» in FAQ Where can I cover my stETH? on stake widget',
    'eth_widget_faq_wherecanicover_nexusmutual',
  ],
  [MATOMO_EVENTS_TYPES.clickFaqWhereCanICoverRibbonFinance]: [
    'Ethereum_Staking_Widget',
    'Push «Ribbon Finance» in FAQ Where can I cover my stETH? on stake widget',
    'eth_widget_faq_wherecanicover_ribbonfinance',
  ],
  [MATOMO_EVENTS_TYPES.clickFaqRisksOfStakingReports]: [
    'Ethereum_Staking_Widget',
    'Push "here" in FAQ  What are the risks of staking with Lido? on stake widget',
    'eth_widget_faq_risksofstaking_reports',
  ],
  [MATOMO_EVENTS_TYPES.clickFaqRisksOfStakingImmunefiBugBounty]: [
    'Ethereum_Staking_Widget',
    'Push "Immunefi bug bounty program" in FAQ  What are the risks of staking with Lido? on stake widget',
    'eth_widget_faq_risksofstaking_immunefibugbounty',
  ],
  [MATOMO_EVENTS_TYPES.clickFaqStethConvertedToEthCurve]: [
    'Ethereum_Staking_Widget',
    'Push «Curve» in FAQ How stETH can be converted to ETH on stake widget',
    'eth_widget_faq_stethconverttoeth_curve',
  ],
  [MATOMO_EVENTS_TYPES.clickFaqStethConvertedToEthBalancer]: [
    'Ethereum_Staking_Widget',
    'Push «Balancer» in FAQ How stETH can be converted to ETH on stake widget',
    'eth_widget_faq_stethconverttoeth_balancer',
  ],
  // /wrap page
  [MATOMO_EVENTS_TYPES.clickL2BannerWrap]: [
    'Ethereum_Staking_Widget',
    'Push "Learn more" at the L2 banner on "Wrap" tab',
    'eth_widget_banner_l2_wrap',
  ],
  // Unwrap tab
  [MATOMO_EVENTS_TYPES.clickL2BannerUnwrap]: [
    'Ethereum_Staking_Widget',
    'Push "Learn more" at the L2 banner on "Unwrap" tab',
    'eth_widget_banner_l2_unwrap',
  ],
  // /rewards page
  [MATOMO_EVENTS_TYPES.calculateRewards]: [
    'Ethereum_Staking_Widget',
    'Push calculate reward button" ',
    'eth_widget_calculate_reward',
  ],
};
