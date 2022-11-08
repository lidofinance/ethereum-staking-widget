import { MatomoEventType } from '@lidofinance/analytics-matomo';

const enum EVENTS {
  // Global
  connectWallet = 'connectWallet',
  // / page
  submitStake = 'submitStake', // needs to be discussed
  clickOneInchDiscount = 'clickOneInchDiscount',
  clickViewEtherscanOnStakePage = 'clickViewEtherscanOnStakePage',
  clickL2BannerStake = 'clickL2BannerStake',
  // FAQ
  clickFaqWhatIsLidoScorecard = 'clickFaqWhatIsLidoScorecard',
  clickFaqWhatIsLidoLearnMore = 'clickFaqWhatIsLidoLearnMore',
  clickFaqHowDoesLidoWorkLearnMore = 'clickFaqHowDoesLidoWorkLearnMore',
  // /wrap page
  submitWrap = 'submitWrap', // needs to be discussed
  submitUnlock = 'submitUnlock', // needs to be discussed
  submitUnwrap = 'submitUnwrap', // needs to be discussed
  clickL2BannerWrap = 'clickL2BannerWrap',
  // Unwrap tab
  clickL2BannerUnwrap = 'clickL2BannerUnwrap',
  // /rewards page
  calculateRewards = 'calculateRewards',
}

export const MATOMO_EVENTS: Record<EVENTS, MatomoEventType> = {
  // Global
  connectWallet: [
    'Ethereum_Staking_Widget',
    'Push "Connect wallet" button',
    'eth_widget_connect_wallet',
  ],
  // / page
  submitStake: [
    'Ethereum_Staking_Widget',
    'Push submit button',
    'eth_widget_stake_eth',
  ],
  clickOneInchDiscount: [
    'Ethereum_Staking_Widget',
    'Push "Get discount" on 1inch banner on widget',
    'eth_widget_oneinch_discount',
  ],
  clickViewEtherscanOnStakePage: [
    'Ethereum_Staking_Widget',
    'Push «View on Etherscan» on the right side of Lido Statistics',
    'eth_widget_etherscan_stakePage',
  ],
  clickL2BannerStake: [
    'Ethereum_Staking_Widget',
    'Push "Learn more" at the L2 banner on "Stake" tab',
    'eth_widget_banner_l2_stake',
  ],
  // FAQ
  // TODO: think - how to add event to md file
  clickFaqWhatIsLidoScorecard: [
    'Ethereum_Staking_Widget',
    'Push «Scorecard» in FAQ What is Lido on stake widget',
    'eth_widget_faq_whatislido_scorecard',
  ],
  clickFaqWhatIsLidoLearnMore: [
    'Ethereum_Staking_Widget',
    'Push «here» in FAQ What is Lido «Learn more here» on stake widget',
    'eth_widget_faq_whatislido_learnmore',
  ],
  clickFaqHowDoesLidoWorkLearnMore: [
    'Ethereum_Staking_Widget',
    'Push «here» in FAQ How does Lido work «Learn more here» on stake widget',
    'eth_widget_faq_howdoeslidowork_learnmore',
  ],
  // /wrap page
  submitWrap: [
    'Ethereum_Staking_Widget',
    'Push "Wrap" button',
    'eth_widget_wrap_eth',
  ],
  submitUnlock: [
    'Ethereum_Staking_Widget',
    'Push "Unlock" button',
    'eth_widget_unlock_eth',
  ],
  submitUnwrap: [
    'Ethereum_Staking_Widget',
    'Push "Unwrap button"',
    'eth_widget_unwrap_eth',
  ],
  clickL2BannerWrap: [
    'Ethereum_Staking_Widget',
    'Push "Learn more" at the L2 banner on "Wrap" tab',
    'eth_widget_banner_l2_wrap',
  ],
  // Unwrap tab
  clickL2BannerUnwrap: [
    'Ethereum_Staking_Widget',
    'Push "Learn more" at the L2 banner on "Unwrap" tab',
    'eth_widget_banner_l2_unwrap',
  ],
  // /rewards page
  calculateRewards: [
    'Ethereum_Staking_Widget',
    'Push calculate reward button" ',
    'eth_widget_calculate_reward',
  ],
};
