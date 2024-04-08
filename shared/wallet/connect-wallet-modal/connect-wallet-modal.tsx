import { useThemeToggle } from '@lidofinance/lido-ui';
import { WalletsModalForEth } from 'reef-knot/connect-wallet-modal';
import { WalletIdsEthereum } from 'reef-knot/wallets';
import { walletsMetrics } from 'consts/matomo-wallets-events';

const WALLETS_PINNED: WalletIdsEthereum[] = ['okx', 'browserExtension'];

export const ConnectWalletModal = () => {
  const { themeName } = useThemeToggle();

  return (
    <WalletsModalForEth
      shouldInvertWalletIcon={themeName === 'dark'}
      metrics={walletsMetrics}
      walletsPinned={WALLETS_PINNED}
    />
  );
};
