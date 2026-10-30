import type { WalletAdapterType } from 'reef-knot/types';
import { walletConnect } from 'wagmi/connectors';

export const OATH_WALLET = {
  id: 'oath',
  name: 'Oath Wallet',
  homepage: 'https://oathwallet.org',
  image_url: '/images/oath-wallet.svg',
  mobile_link: 'oathwallet://',
  app_store: 'https://apps.apple.com/app/id6780187283',
};

export const isOathAvailable = (
  userAgent = globalThis.navigator?.userAgent ?? '',
) => !/android/i.test(userAgent);

// Reef-Knot's shared button controls icon dimensions, shape and spacing.
const OathIcon = () => <img src={OATH_WALLET.image_url} alt="" />;

export const OathWallet: WalletAdapterType = ({ walletconnectProjectId }) => {
  const connector = walletConnect({
    projectId: walletconnectProjectId ?? '',
    showQrModal: true,
    customStoragePrefix: 'lido-oath-wallet',
    qrModalOptions: { themeVariables: { '--wcm-z-index': '1000' } },
  });

  return {
    walletId: OATH_WALLET.id,
    walletName: OATH_WALLET.name,
    type: walletConnect.type,
    icon: OathIcon,
    downloadURLs: {
      default: OATH_WALLET.app_store,
      ios: OATH_WALLET.app_store,
    },
    createConnectorFn: (config) => {
      const base = connector(config);
      return {
        ...base,
        id: OATH_WALLET.id,
        name: OATH_WALLET.name,
        requestedChainsStorageKey: 'oath.requestedChains',
        connect: async function (
          this: ReturnType<typeof connector>,
          parameters,
        ) {
          const { ModalController, RouterController } =
            await import('@reown/appkit-controllers');
          // The provider still owns pairing and cancellation. Select the named
          // wallet view only for this attempt, after its native modal opens.
          // Desktop renders the QR; iOS renders the native app handoff.
          const unsubscribe = ModalController.subscribeKey('open', (open) => {
            if (open) {
              RouterController.reset('ConnectingWalletConnect', {
                wallet: OATH_WALLET,
              });
            }
          });
          try {
            return await base.connect.call(this, parameters);
          } finally {
            unsubscribe();
          }
        } as typeof base.connect,
      };
    },
  };
};
