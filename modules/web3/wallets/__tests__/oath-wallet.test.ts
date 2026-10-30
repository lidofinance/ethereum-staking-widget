import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WalletAdapterArgs } from 'reef-knot/types';
import { providersStore } from 'reef-knot/core-react';
import { mainnet } from 'wagmi/chains';
import { CoreHelperUtil } from '@reown/appkit-controllers';
import { OATH_WALLET, OathWallet, isOathAvailable } from '../oath-wallet';

const mocks = vi.hoisted(() => ({
  connect: vi.fn(),
  disconnect: vi.fn(),
  getProvider: vi.fn(),
  walletConnect: vi.fn(),
  reset: vi.fn(),
  unsubscribe: vi.fn(),
  subscribe: vi.fn(),
}));

vi.mock('wagmi/connectors', () => ({
  walletConnect: Object.assign(mocks.walletConnect, { type: 'walletConnect' }),
}));
vi.mock('@reown/appkit-controllers', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@reown/appkit-controllers')>()),
  ModalController: { subscribeKey: mocks.subscribe },
  RouterController: { reset: mocks.reset },
}));

const adapterArgs = {
  providersStore,
  walletconnectProjectId: 'test-project',
  defaultChain: mainnet,
  rpc: { 1: 'https://ethereum.example' },
} as WalletAdapterArgs;
const connectorConfig = {} as Parameters<
  ReturnType<typeof OathWallet>['createConnectorFn']
>[0];

beforeEach(() => {
  vi.clearAllMocks();
  mocks.connect.mockResolvedValue({ accounts: [], chainId: 1 });
  mocks.walletConnect.mockReturnValue(() => ({
    id: 'walletConnect',
    name: 'WalletConnect',
    type: 'walletConnect',
    connect: mocks.connect,
    disconnect: mocks.disconnect,
    getProvider: mocks.getProvider,
  }));
  mocks.subscribe.mockReturnValue(mocks.unsubscribe);
});

describe('Oath Reef-Knot adapter', () => {
  it('uses the native WalletConnect button and an isolated provider store', () => {
    const wallet = OathWallet(adapterArgs);
    expect(wallet).toMatchObject({
      walletId: 'oath',
      walletName: 'Oath Wallet',
      type: 'walletConnect',
    });
    expect(wallet.downloadURLs?.ios).toBe(
      'https://apps.apple.com/app/id6780187283',
    );
    expect(mocks.walletConnect).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'test-project',
        showQrModal: true,
        customStoragePrefix: 'lido-oath-wallet',
      }),
    );
    const connector = wallet.createConnectorFn(connectorConfig);
    expect(connector.id).toBe('oath');
    expect(connector).toHaveProperty(
      'requestedChainsStorageKey',
      'oath.requestedChains',
    );
    expect(connector.disconnect).toBe(mocks.disconnect);
    expect(connector.getProvider).toBe(mocks.getProvider);
  });

  it('opens the Oath view only when its pairing modal opens', async () => {
    const connector =
      OathWallet(adapterArgs).createConnectorFn(connectorConfig);
    mocks.connect.mockImplementation(async function () {
      const onOpen = mocks.subscribe.mock.calls[0][1];
      onOpen(false);
      expect(mocks.reset).not.toHaveBeenCalled();
      onOpen(true);
      expect(mocks.reset).toHaveBeenCalledWith('ConnectingWalletConnect', {
        wallet: OATH_WALLET,
      });
      return { accounts: [], chainId: 1 };
    });
    await connector.connect({ chainId: 1 });
    expect(mocks.connect.mock.calls[0][0]).toEqual({ chainId: 1 });
    expect(mocks.connect.mock.contexts[0]).toBe(connector);
    expect(mocks.unsubscribe).toHaveBeenCalledOnce();
  });

  it('preserves rejection and removes the route listener so the generic wallet remains independent', async () => {
    const failure = new Error('Connection request reset. Please try again.');
    mocks.connect.mockRejectedValue(failure);
    const connector =
      OathWallet(adapterArgs).createConnectorFn(connectorConfig);
    await expect(connector.connect()).rejects.toBe(failure);
    expect(mocks.unsubscribe).toHaveBeenCalledOnce();
  });

  it.each([
    'Mozilla/5.0 (iPhone)',
    'Mozilla/5.0 (iPad)',
    'Mozilla/5.0 (Macintosh)',
    '',
  ])('offers the native iOS wallet on %s', (ua) => {
    expect(isOathAvailable(ua)).toBe(true);
  });

  it('does not advertise an Android application', () => {
    expect(isOathAvailable('Mozilla/5.0 (Linux; Android 15)')).toBe(false);
  });

  it('uses the installed AppKit formatter to encode the whole pairing URI exactly once', () => {
    const uri =
      'wc:test-topic@2?relay-protocol=irn&symKey=test-only&expiryTimestamp=123';
    const result = CoreHelperUtil.formatNativeUrl(OATH_WALLET.mobile_link, uri);
    expect(result.redirect).toBe(
      `oathwallet://wc?uri=${encodeURIComponent(uri)}`,
    );
    expect(decodeURIComponent(result.redirect.split('?uri=')[1])).toBe(uri);
  });
});
