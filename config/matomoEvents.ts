import { MatomoEvent } from 'utils';

const enum EVENTS {
  // Global
  connectWallet = 'connectWallet',
  clickL2Banner = 'clickL2Banner',
  clickCurvePool = 'clickCurvePool',
  clickBalancerPool = 'clickBalancerPool',
  // / page
  submitStake = 'submitStake', // needs to be discussed
  clickOneInchDiscount = 'clickOneInchDiscount',
  clickViewEtherscanOnStakePage = 'clickViewEtherscanOnStakePage',
  // FAQ
  clickFaqWhatIsLidoScorecard = 'clickFaqWhatIsLidoScorecard',
  clickFaqWhatIsLidoLearnMore = 'clickFaqWhatIsLidoLearnMore',
  clickFaqHowDoesLidoWorkLearnMore = 'clickFaqHowDoesLidoWorkLearnMore',
  // /wrap page
  submitWrap = 'submitWrap', // needs to be discussed
  submitUnlock = 'submitUnlock', // needs to be discussed
  submitUnwrap = 'submitUnwrap', // needs to be discussed
  // /rewards page
  calculateRewards = 'calculateRewards',
}

export const MATOMO_EVENTS: Record<EVENTS, MatomoEvent> = {
  // Global
  connectWallet: [
    'Ethereum_Stacking_Widget',
    'Push "Connect wallet" button',
    'eth_widget_connect_wallet',
  ],
  clickL2Banner: [
    'Ethereum_Stacking_Widget',
    'Push "Learn more" on l2 banner on widget',
    'eth_widget_l2_learn',
  ],
  clickCurvePool: [
    'Ethereum_Stacking_Widget',
    'Push "Explore" on curve banner on widget',
    'eth_widget_curve_explore',
  ],
  clickBalancerPool: [
    'Ethereum_Stacking_Widget',
    'Push "Explore" on balancer banner on widget',
    'eth_widget_balancer_explore',
  ],
  // / page
  submitStake: [
    'Ethereum_Stacking_Widget',
    'Push submit button',
    'eth_widget_stake_eth',
  ],
  clickOneInchDiscount: [
    'Ethereum_Stacking_Widget',
    'Push "Get discount" on 1inch banner on widget',
    'eth_widget_oneinch_discount',
  ],
  clickViewEtherscanOnStakePage: [
    'Ethereum_Stacking_Widget',
    'Push «View on Etherscan» on the right side of Lido Statistics',
    'eth_widget_etherscan_stakePage',
  ],
  // FAQ
  // TODO: think - how to add event to md file
  clickFaqWhatIsLidoScorecard: [
    'Ethereum_Stacking_Widget',
    'Push «Scorecard» in FAQ What is Lido on stake widget',
    'eth_widget_faq_whatislido_scorecard',
  ],
  clickFaqWhatIsLidoLearnMore: [
    'Ethereum_Stacking_Widget',
    'Push «here» in FAQ What is Lido «Learn more here» on stake widget',
    'eth_widget_faq_whatislido_learnmore',
  ],
  clickFaqHowDoesLidoWorkLearnMore: [
    'Ethereum_Stacking_Widget',
    'Push «here» in FAQ How does Lido work «Learn more here» on stake widget',
    'eth_widget_faq_howdoeslidowork_learnmore',
  ],
  // /wrap page
  submitWrap: [
    'Ethereum_Stacking_Widget',
    'Push "Wrap" button',
    'eth_widget_wrap_eth',
  ],
  submitUnlock: [
    'Ethereum_Stacking_Widget',
    'Push "Unlock" button',
    'eth_widget_unlock_eth',
  ],
  submitUnwrap: [
    'Ethereum_Stacking_Widget',
    'Push "Unwrap button"',
    'eth_widget_unwrap_eth',
  ],
  // /rewards page
  calculateRewards: [
    'Ethereum_Stacking_Widget',
    'Push calculate reward button" ',
    'eth_widget_calculate_reward',
  ],
};
