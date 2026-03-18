import { useMemo } from 'react';
import {
  WHALE_BANNER_THRESHOLD_1,
  WHALE_BANNER_THRESHOLD_2,
  WHALE_BANNER_THRESHOLD_3,
  WHALE_BANNER_LINKS,
  WHALE_BANNER_BODY_TEXT,
  WHALE_BANNER_HEADINGS,
} from './consts';
import { useWhaleBannerABVariant } from './use-whale-banner-ab-variant';
import type { WhaleBannerConfig } from './types';
import { overrideWithQAMockEther } from 'utils/qa';

const QA_MOCK_KEY = 'mockWhaleBannerStethBalance';

export const useWhaleBanner = (
  amount: bigint | undefined,
): WhaleBannerConfig | null => {
  const variant = useWhaleBannerABVariant();
  const effectiveAmount = overrideWithQAMockEther(amount, QA_MOCK_KEY);

  return useMemo(() => {
    if (effectiveAmount === undefined || effectiveAmount === 0n) return null;

    const heading = WHALE_BANNER_HEADINGS[variant];
    const body = WHALE_BANNER_BODY_TEXT;

    if (effectiveAmount >= WHALE_BANNER_THRESHOLD_3) {
      return {
        level: 3,
        heading,
        body,
        ctas: [
          { text: 'Contact me', href: WHALE_BANNER_LINKS.CONTACT_ME },
          { text: 'Book a call', href: WHALE_BANNER_LINKS.BOOK_A_CALL },
        ],
      };
    }

    if (effectiveAmount >= WHALE_BANNER_THRESHOLD_2) {
      return {
        level: 2,
        heading,
        body,
        ctas: [
          { text: 'Contact me', href: WHALE_BANNER_LINKS.CONTACT_ME },
          { text: 'Book a call', href: WHALE_BANNER_LINKS.BOOK_A_CALL },
        ],
      };
    }

    if (effectiveAmount >= WHALE_BANNER_THRESHOLD_1) {
      return {
        level: 1,
        heading,
        body,
        ctas: [
          { text: 'Get in touch', href: WHALE_BANNER_LINKS.GET_IN_TOUCH },
        ],
      };
    }

    return null;
  }, [effectiveAmount, variant]);
};
