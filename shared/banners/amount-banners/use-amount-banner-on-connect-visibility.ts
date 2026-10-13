import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

import { useConfig } from 'config';
import { useDappStatus, useStethBalance } from 'modules/web3';
import { useLocalStorage } from 'shared/hooks/use-local-storage';
import { useEarnVaultPageMatch } from 'shared/hooks/use-earn-vault-page-match';

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
    const [searchParams] = useSearchParams();
    const { featureFlags } = useConfig().externalConfig;
    const { data: stethBalance } = useStethBalance();
    const bannerConfig = useAmountBanner(stethBalance, initialBalance);

    const isReferralUser = Boolean(searchParams.get('ref'));
    // Prevent showing banner on earn vault pages
    const isVaultPage = !!useEarnVaultPageMatch();

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
