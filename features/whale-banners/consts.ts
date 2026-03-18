import { parseEther } from 'viem';

// Threshold values (in ETH/stETH/wstETH, denominated in wei)
// Tier 1: 150 – ≤500
// Tier 2: >500 – ≤1,000
// Tier 3: >1,000
export const WHALE_BANNER_THRESHOLD_1 = parseEther('150');
export const WHALE_BANNER_THRESHOLD_2 = parseEther('500');
export const WHALE_BANNER_THRESHOLD_3 = parseEther('1000');

export const WHALE_BANNER_LINKS = {
  GET_IN_TOUCH:
    'https://share-eu1.hsforms.com/1B8pLtartQYWwLXLw8K8oOw2dywmt',
  CONTACT_ME:
    'https://share-eu1.hsforms.com/1H4FscQB8T5i_8t0rNYUkDg2dywmt',
  BOOK_A_CALL: 'https://meetings-eu1.hubspot.com/dominic-m/discovery',
} as const;

export const WHALE_BANNER_AB_STORAGE_KEY = 'lido-whale-banner-ab-variant';

export const WHALE_BANNER_BODY_TEXT =
  'Connect with Lido contributors for opportunities across Lido Earn, V3, and institutional staking.';

export const WHALE_BANNER_HEADINGS = {
  A: 'Dedicated support for large stakers',
  B: 'Looking to do more with your stETH?',
} as const;
