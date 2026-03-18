import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useConfig } from 'config';
import { useDappStatus, useStethBalance, useWstethBalance } from 'modules/web3';
import { useWhaleBanner } from './use-whale-banner';
import { useModalActions } from 'providers/modal-provider';
import { WhaleBannerModal } from './whale-banner-modal';

export type WhaleBannerToken = 'stETH' | 'wstETH';

// Tracks shown state per session per wallet address
const shownForAddress = new Set<string>();

type UseWhaleBannerOnConnectOptions = {
  token?: WhaleBannerToken;
};

/**
 * Shows a whale banner modal once per session when a non-referral user
 * has their wallet connected and holds a qualifying balance above the lowest threshold.
 * Pass token='wstETH' on pages that operate with wstETH (e.g. Wrap).
 */
export const useWhaleBannerOnConnect = ({
  token = 'stETH',
}: UseWhaleBannerOnConnectOptions = {}) => {
  const { address } = useDappStatus();
  const { query } = useRouter();
  const { openModal } = useModalActions();
  const { featureFlags } = useConfig().externalConfig;

  const { data: stethBalance } = useStethBalance();
  const { data: wstethBalance } = useWstethBalance();

  const balance = token === 'wstETH' ? wstethBalance : stethBalance;
  const bannerConfig = useWhaleBanner(balance);

  const isReferralUser = Boolean(query.ref);
  // Track the address for which we have already attempted the check
  const checkedAddressRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!featureFlags.whaleBannerEnabled) return;

    if (!address) {
      // Wallet disconnected – reset so next connect attempt is fresh
      checkedAddressRef.current = undefined;
      return;
    }

    if (isReferralUser) return;
    // Balance still loading – wait for next run when balance resolves
    if (balance === undefined) return;
    // Already shown for this address this session
    if (shownForAddress.has(address)) return;
    // Already triggered the check for this address (no qualifying balance)
    if (checkedAddressRef.current === address) return;

    checkedAddressRef.current = address;

    if (!bannerConfig) return;

    shownForAddress.add(address);
    openModal(WhaleBannerModal, { bannerConfig });
  }, [
    address,
    balance,
    bannerConfig,
    featureFlags.whaleBannerEnabled,
    isReferralUser,
    openModal,
  ]);
};
