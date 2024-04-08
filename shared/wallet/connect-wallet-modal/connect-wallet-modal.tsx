import { WalletsModalForEth } from 'reef-knot/connect-wallet-modal';
import { useThemeToggle } from '@lidofinance/lido-ui';

import { walletsMetrics } from 'consts/matomo-wallets-events';

export const ConnectWalletModal = () => {
  const { themeName } = useThemeToggle();

  return (
    <WalletsModalForEth
      shouldInvertWalletIcon={themeName === 'dark'}
      metrics={walletsMetrics}
    />
  );
};
