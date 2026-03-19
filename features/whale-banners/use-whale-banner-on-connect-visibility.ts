import { useCallback } from 'react';
import { useRouter } from 'next/router';

import { useConfig } from 'config';
import { useDappStatus, useStethBalance } from 'modules/web3';
import { useLocalStorage } from 'shared/hooks/use-local-storage';

import { WHALE_BANNER_DISMISSED_STORAGE_KEY } from './consts';
import { useWhaleBanner } from './use-whale-banner';
import type { WhaleBannerConfig } from './types';

type WhaleBannerOnConnectVisibility = {
  shouldShow: boolean;
  bannerConfig: WhaleBannerConfig | null;
  dismiss: () => void;
};

export const useWhaleBannerOnConnectVisibility =
  (): WhaleBannerOnConnectVisibility => {
    const { address } = useDappStatus();
    const { query } = useRouter();
    const { featureFlags } = useConfig().externalConfig;
    const { data: stethBalance } = useStethBalance();
    const bannerConfig = useWhaleBanner(stethBalance);
    const isReferralUser = Boolean(query.ref);

    const [isDismissed, setDismissed] = useLocalStorage(
      WHALE_BANNER_DISMISSED_STORAGE_KEY,
      false,
    );

    const dismiss = useCallback(() => {
      setDismissed(true);
    }, [setDismissed]);

    const shouldShow =
      featureFlags.whaleBannerEnabled === true &&
      !!address &&
      !isReferralUser &&
      stethBalance !== undefined &&
      !isDismissed &&
      bannerConfig !== null;

    return { shouldShow, bannerConfig, dismiss };
  };
