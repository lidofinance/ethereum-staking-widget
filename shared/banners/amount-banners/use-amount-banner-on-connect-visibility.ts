import { useCallback } from 'react';
import { useRouter } from 'next/router';

import { useConfig } from 'config';
import { useDappStatus, useStethBalance } from 'modules/web3';
import { useLocalStorage } from 'shared/hooks/use-local-storage';

import { AMOUNT_BANNER_DISMISSED_STORAGE_KEY } from './consts';
import { useAmountBanner } from './use-amount-banner';
import type { AmountBannerConfig } from './types';

type AmountBannerOnConnectVisibility = {
  shouldShow: boolean;
  bannerConfig: AmountBannerConfig | null;
  dismiss: () => void;
};

export const useAmountBannerOnConnectVisibility =
  (): AmountBannerOnConnectVisibility => {
    const { address } = useDappStatus();
    const { query } = useRouter();
    const { featureFlags } = useConfig().externalConfig;
    const { data: stethBalance } = useStethBalance();
    const bannerConfig = useAmountBanner(stethBalance);
    const isReferralUser = Boolean(query.ref);

    const [isDismissed, setDismissed] = useLocalStorage(
      AMOUNT_BANNER_DISMISSED_STORAGE_KEY,
      false,
    );

    const dismiss = useCallback(() => {
      setDismissed(true);
    }, [setDismissed]);

    const shouldShow =
      featureFlags.amountBannerEnabled === true &&
      !!address &&
      !isReferralUser &&
      stethBalance !== undefined &&
      !isDismissed &&
      bannerConfig !== null;

    return { shouldShow, bannerConfig, dismiss };
  };
