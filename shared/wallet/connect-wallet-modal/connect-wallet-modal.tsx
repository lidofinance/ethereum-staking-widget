import { useThemeToggle } from '@lidofinance/lido-ui';
import { WalletsModalForEth } from 'reef-knot/connect-wallet-modal';
import { walletsMetrics } from 'config/matomoWalletsEvents';
import type { ModalComponentType } from 'providers/modal-provider';

export const ConnectWalletModal: ModalComponentType = (props) => {
  const { themeName } = useThemeToggle();

  return (
    <WalletsModalForEth
      {...props}
      shouldInvertWalletIcon={themeName === 'dark'}
      metrics={walletsMetrics}
    />
  );
};
