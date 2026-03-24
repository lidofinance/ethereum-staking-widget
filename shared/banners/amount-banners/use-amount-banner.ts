import { useMemo } from 'react';

import { overrideWithQAMockEther } from 'utils/qa';

import { useAmountBannerABVariant } from './use-amount-banner-ab-variant';
import {
  AMOUNT_BANNER_THRESHOLD_1,
  AMOUNT_BANNER_THRESHOLD_2,
  AMOUNT_BANNER_THRESHOLD_3,
  AMOUNT_BANNER_LINKS,
  AMOUNT_BANNER_BODY_TEXT,
  AMOUNT_BANNER_HEADINGS,
} from './consts';
import type { AmountBannerConfig } from './types';

const QA_MOCK_KEY = 'mockAmountBannerStethBalance';

export const useAmountBanner = (
  amount: bigint | undefined,
  initialBalance?: bigint,
): AmountBannerConfig | null => {
  const variant = useAmountBannerABVariant();
  const effectiveAmount = overrideWithQAMockEther(amount, QA_MOCK_KEY);

  return useMemo(() => {
    if (effectiveAmount === undefined || effectiveAmount === 0n) return null;

    const heading = AMOUNT_BANNER_HEADINGS[variant];
    const body = AMOUNT_BANNER_BODY_TEXT;

    // If the initial balance is greater than the threshold, don't show the banner
    if (initialBalance && initialBalance >= AMOUNT_BANNER_THRESHOLD_1)
      return null;

    if (effectiveAmount >= AMOUNT_BANNER_THRESHOLD_3) {
      return {
        level: 3,
        variant,
        heading,
        body,
        ctas: [
          { text: 'Contact me', href: AMOUNT_BANNER_LINKS.CONTACT_ME },
          { text: 'Book a call', href: AMOUNT_BANNER_LINKS.BOOK_A_CALL },
        ],
      };
    }

    if (effectiveAmount >= AMOUNT_BANNER_THRESHOLD_2) {
      return {
        level: 2,
        variant,
        heading,
        body,
        ctas: [
          { text: 'Contact me', href: AMOUNT_BANNER_LINKS.CONTACT_ME },
          { text: 'Book a call', href: AMOUNT_BANNER_LINKS.BOOK_A_CALL },
        ],
      };
    }

    if (effectiveAmount >= AMOUNT_BANNER_THRESHOLD_1) {
      return {
        level: 1,
        variant,
        heading,
        body,
        ctas: [
          { text: 'Get in touch', href: AMOUNT_BANNER_LINKS.GET_IN_TOUCH },
        ],
      };
    }

    return null;
  }, [effectiveAmount, initialBalance, variant]);
};
