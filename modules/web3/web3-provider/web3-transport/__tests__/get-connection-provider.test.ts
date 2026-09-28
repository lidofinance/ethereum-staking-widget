import { vi } from 'vitest';
import type { Connection } from 'wagmi';
import { providersStore } from 'reef-knot/core-react';

import { getConnectionProvider } from '../get-connection-provider';

vi.mock('reef-knot/core-react', () => ({
  providersStore: { findProvider: vi.fn() },
}));

// eslint-disable-next-line @typescript-eslint/unbound-method -- the mock factory provides a plain vi.fn, there is no `this` to unbind
const findProviderMock = vi.mocked(providersStore.findProvider);

const ACCOUNT = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

const walletProvider = (accounts: string[], chainIdHex: string) => ({
  request: vi.fn(async ({ method }: { method: string }) => {
    if (method === 'eth_accounts') return accounts;
    if (method === 'eth_chainId') return chainIdHex;
    throw new Error(`unexpected method ${method}`);
  }),
});

const makeConnection = (connector: Record<string, unknown>) =>
  ({
    accounts: [ACCOUNT],
    chainId: 1,
    connector,
  }) as unknown as Connection;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getConnectionProvider', () => {
  it('returns the connector provider for injected connections', async () => {
    const provider = walletProvider([ACCOUNT], '0x1');
    const getProvider = vi.fn(async () => provider);
    const connection = makeConnection({ type: 'injected', getProvider });

    await expect(getConnectionProvider(connection)).resolves.toBe(provider);
    expect(getProvider).toHaveBeenCalledWith({ chainId: 1 });
  });

  it('returns null when the injected provider serves another account', async () => {
    const provider = walletProvider(
      ['0x0000000000000000000000000000000000000002'],
      '0x1',
    );
    const connection = makeConnection({
      type: 'injected',
      getProvider: vi.fn(async () => provider),
    });

    await expect(getConnectionProvider(connection)).resolves.toBeNull();
  });

  it('returns null when the injected provider is on another chain', async () => {
    const provider = walletProvider([ACCOUNT], '0x5');
    const connection = makeConnection({
      type: 'injected',
      getProvider: vi.fn(async () => provider),
    });

    await expect(getConnectionProvider(connection)).resolves.toBeNull();
  });

  it('returns null when the injected provider rejects validation requests', async () => {
    const provider = {
      request: vi.fn(async () => {
        throw new Error('locked');
      }),
    };
    const connection = makeConnection({
      type: 'injected',
      getProvider: vi.fn(async () => provider),
    });

    await expect(getConnectionProvider(connection)).resolves.toBeNull();
  });

  it('returns null for unknown connector types', async () => {
    const connection = makeConnection({
      type: 'walletConnect',
      getProvider: vi.fn(async () => walletProvider([ACCOUNT], '0x1')),
    });

    await expect(getConnectionProvider(connection)).resolves.toBeNull();
  });

  describe('metaMask connections', () => {
    const metaMaskConnection = () =>
      makeConnection({
        type: 'metaMask',
        rdns: ['io.metamask', 'io.metamask.mobile'],
      });

    it('returns the EIP-6963 provider matching connection account and chain', async () => {
      const provider = walletProvider([ACCOUNT], '0x1');
      findProviderMock.mockImplementation(({ rdns }) =>
        rdns === 'io.metamask' ? ({ provider } as never) : undefined,
      );

      await expect(getConnectionProvider(metaMaskConnection())).resolves.toBe(
        provider,
      );
    });

    it('matches the account case-insensitively', async () => {
      const provider = walletProvider([ACCOUNT.toLowerCase()], '0x1');
      findProviderMock.mockReturnValue({ provider } as never);

      await expect(getConnectionProvider(metaMaskConnection())).resolves.toBe(
        provider,
      );
    });

    it('tries every rdns the connector declares', async () => {
      const provider = walletProvider([ACCOUNT], '0x1');
      findProviderMock.mockImplementation(({ rdns }) =>
        rdns === 'io.metamask.mobile' ? ({ provider } as never) : undefined,
      );

      await expect(getConnectionProvider(metaMaskConnection())).resolves.toBe(
        provider,
      );
      expect(findProviderMock).toHaveBeenCalledWith({ rdns: 'io.metamask' });
      expect(findProviderMock).toHaveBeenCalledWith({
        rdns: 'io.metamask.mobile',
      });
    });

    it('returns null when the extension serves another account', async () => {
      const provider = walletProvider(
        ['0x0000000000000000000000000000000000000002'],
        '0x1',
      );
      findProviderMock.mockReturnValue({ provider } as never);

      await expect(
        getConnectionProvider(metaMaskConnection()),
      ).resolves.toBeNull();
    });

    it('returns null when the extension is on another chain', async () => {
      const provider = walletProvider([ACCOUNT], '0x5');
      findProviderMock.mockReturnValue({ provider } as never);

      await expect(
        getConnectionProvider(metaMaskConnection()),
      ).resolves.toBeNull();
    });

    it('returns null when the provider rejects validation requests', async () => {
      const provider = {
        request: vi.fn(async () => {
          throw new Error('locked');
        }),
      };
      findProviderMock.mockReturnValue({ provider } as never);

      await expect(
        getConnectionProvider(metaMaskConnection()),
      ).resolves.toBeNull();
    });

    it('returns null when no EIP-6963 provider is announced', async () => {
      findProviderMock.mockReturnValue(undefined);

      await expect(
        getConnectionProvider(metaMaskConnection()),
      ).resolves.toBeNull();
    });

    it('returns null when the connector declares no rdns', async () => {
      const connection = makeConnection({ type: 'metaMask' });

      await expect(getConnectionProvider(connection)).resolves.toBeNull();
      expect(findProviderMock).not.toHaveBeenCalled();
    });
  });
});
