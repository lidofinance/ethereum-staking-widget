import { trackEvent } from '@lidofinance/analytics-matomo';
import type { AmountBannerABVariant } from './types';

export type AmountBannerPlacement =
  | 'after_stake'
  | 'disconnect_wallet'
  | 'connect_wallet';

const CATEGORY = 'Ethereum_Staking_Widget_Insti';

const VARIANT_LABELS: Record<AmountBannerABVariant, string> = {
  A: 'Dedicated support',
  B: 'Looking to do more',
};

const PLACEMENT_LABELS: Record<AmountBannerPlacement, string> = {
  after_stake: 'after stake',
  disconnect_wallet: 'disconnect wallet',
  connect_wallet: 'connect wallet',
};

// [ctaText][variant] → slug для event name
const CTA_VARIANT_SLUGS: Record<
  string,
  Record<AmountBannerABVariant, string>
> = {
  'Get in touch': {
    A: 'get_in_touch_dedicated_support',
    B: 'get_in_touch_looking_to_do_more',
  },
  'Contact me': {
    A: 'contact_me_dedicated_support',
    B: 'contact_me_looking_to_do_more',
  },
  'Book a call': {
    A: 'book_a_call_dedicated_support_more',
    B: 'book_a_call_looking_to_do_more',
  },
};

export const trackAmountBannerCtaClick = (
  ctaText: string,
  variant: AmountBannerABVariant,
  placement: AmountBannerPlacement,
) => {
  const slug = CTA_VARIANT_SLUGS[ctaText]?.[variant];
  if (!slug) return;

  const action = `Click on "${ctaText}" ${VARIANT_LABELS[variant]} ${PLACEMENT_LABELS[placement]}`;

  trackEvent(CATEGORY, action, `eth_widget_${slug}_${placement}`);
};
