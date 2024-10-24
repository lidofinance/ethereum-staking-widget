import { useThemeToggle } from '@lidofinance/lido-ui';
import { WalletsModalForEth } from 'reef-knot/connect-wallet-modal';
import { WalletIdsEthereum } from 'reef-knot/wallets';

import { config } from 'config';
import { walletsMetrics } from 'consts/matomo-wallets-events';
import { trackEvent } from '@lidofinance/analytics-matomo';
import { MATOMO_CLICK_EVENTS } from 'consts/matomo-click-events';

const WALLETS_PINNED: WalletIdsEthereum[] = [
  'binanceWallet',
  'browserExtension',
];

export const ConnectWalletModal = () => {
  const { themeName } = useThemeToggle();

  return (
    <WalletsModalForEth
      shouldInvertWalletIcon={themeName === 'dark'}
      metrics={walletsMetrics}
      walletsPinned={WALLETS_PINNED}
      termsLink={`${config.rootOrigin}/terms-of-use`}
      privacyNoticeLink={`${config.rootOrigin}/privacy-notice`}
      onClickWalletsMore={() =>
        trackEvent(...MATOMO_CLICK_EVENTS.clickShowMoreWallets)
      }
      onClickWalletsLess={() =>
        trackEvent(...MATOMO_CLICK_EVENTS.clickShowLessWallets)
      }
    />
  );
};
