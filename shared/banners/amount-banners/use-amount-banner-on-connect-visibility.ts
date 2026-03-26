import { useCallback } from 'react';
import { useRouter } from 'next/router';

import { useConfig } from 'config';
import { useDappStatus, useStethBalance } from 'modules/web3';
import { useLocalStorage } from 'shared/hooks/use-local-storage';

import { AMOUNT_BANNER_DISMISSED_STORAGE_KEY } from './consts';
import { useAmountBanner } from './use-amount-banner';
import type { AmountBannerConfig } from './types';

type UseAmountBannerOnConnectVisibility = ({
  initialBalance,
  isDismissible,
}: {
  initialBalance?: bigint;
  isDismissible?: boolean;
}) => {
  shouldShow: boolean;
  bannerConfig: AmountBannerConfig | null;
  dismiss: () => void;
};

export const useAmountBannerOnConnectVisibility: UseAmountBannerOnConnectVisibility =
  ({ initialBalance, isDismissible }) => {
    const { address } = useDappStatus();
    const { query, pathname } = useRouter();
    const { featureFlags } = useConfig().externalConfig;
    const { data: stethBalance } = useStethBalance();
    const bannerConfig = useAmountBanner(stethBalance, initialBalance);

    const isReferralUser = Boolean(query.ref);
    // Prevent showing banner on earn vault pages
    const isVaultPage = pathname === '/earn/[vault]/[action]';

    const [isDismissed, setDismissed] = useLocalStorage(
      AMOUNT_BANNER_DISMISSED_STORAGE_KEY,
      false,
    );

    const dismiss = useCallback(() => {
      setDismissed(true);
    }, [setDismissed]);

    const notDismissedOrNotDismissible = !isDismissible || !isDismissed;

    const shouldShow =
      featureFlags.amountBannerEnabled === true &&
      !!address &&
      !isReferralUser &&
      stethBalance !== undefined &&
      notDismissedOrNotDismissible &&
      !isVaultPage &&
      bannerConfig !== null;

    return {
      shouldShow,
      bannerConfig,
      dismiss,
    };
  };
