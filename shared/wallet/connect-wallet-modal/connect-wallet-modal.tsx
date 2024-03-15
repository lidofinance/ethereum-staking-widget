import { useThemeToggle } from '@lidofinance/lido-ui';
import { WalletsModalForEth } from 'reef-knot/connect-wallet-modal';
import { walletsMetrics } from 'config/matomoWalletsEvents';

export const ConnectWalletModal = () => {
  const { themeName } = useThemeToggle();

  return (
    <WalletsModalForEth
      shouldInvertWalletIcon={themeName === 'dark'}
      metrics={walletsMetrics}
    />
  );
};
