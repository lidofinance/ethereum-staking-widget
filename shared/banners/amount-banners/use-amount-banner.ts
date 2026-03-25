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

const QA_AMOUNT_MOCK_KEY = 'mockAmountBannerStethBalance';
const QA_AMOUNT_THRESHOLD_1_MOCK_KEY = 'mockAmountBannerStethBalanceThreshold1';
const QA_AMOUNT_THRESHOLD_2_MOCK_KEY = 'mockAmountBannerStethBalanceThreshold2';
const QA_AMOUNT_THRESHOLD_3_MOCK_KEY = 'mockAmountBannerStethBalanceThreshold3';

export const useAmountBanner = (
  amount: bigint | undefined,
  initialBalance?: bigint,
): AmountBannerConfig | null => {
  const variant = useAmountBannerABVariant();
  const effectiveAmount = overrideWithQAMockEther(
    amount ?? 0n,
    QA_AMOUNT_MOCK_KEY,
  );
  const amountThreshold1 = overrideWithQAMockEther(
    AMOUNT_BANNER_THRESHOLD_1,
    QA_AMOUNT_THRESHOLD_1_MOCK_KEY,
  );
  const amountThreshold2 = overrideWithQAMockEther(
    AMOUNT_BANNER_THRESHOLD_2,
    QA_AMOUNT_THRESHOLD_2_MOCK_KEY,
  );
  const amountThreshold3 = overrideWithQAMockEther(
    AMOUNT_BANNER_THRESHOLD_3,
    QA_AMOUNT_THRESHOLD_3_MOCK_KEY,
  );

  return useMemo(() => {
    if (effectiveAmount === undefined || effectiveAmount === 0n) return null;

    const heading = AMOUNT_BANNER_HEADINGS[variant];
    const body = AMOUNT_BANNER_BODY_TEXT;

    // If the initial balance is greater than the threshold, don't show the banner
    if (initialBalance && initialBalance >= amountThreshold1) return null;

    if (effectiveAmount >= amountThreshold3) {
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

    if (effectiveAmount >= amountThreshold2) {
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

    if (effectiveAmount >= amountThreshold1) {
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
  }, [
    amountThreshold1,
    amountThreshold2,
    amountThreshold3,
    effectiveAmount,
    initialBalance,
    variant,
  ]);
};
