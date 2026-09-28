import { vi } from 'vitest';
import type { Chain, Transport, EIP1193Provider } from 'viem';
import type { Connection } from 'wagmi';

import { createActiveConnectionListener } from '../use-web3-transport';
import { getConnectionProvider } from '../get-connection-provider';

vi.mock('../get-connection-provider', () => ({
  getConnectionProvider: vi.fn(),
}));

vi.mock('viem', async (importOriginal) => ({
  ...(await importOriginal<typeof import('viem')>()),
  custom: vi.fn((provider: EIP1193Provider) => ({ provider }) as never),
}));

const getConnectionProviderMock = vi.mocked(getConnectionProvider);

const CHAINS = [{ id: 1 }, { id: 10 }] as Chain[];

const makeConnection = (chainId: number, uid: string) =>
  ({
    accounts: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'],
    chainId,
    connector: { uid },
  }) as unknown as Connection;

const makeProvider = (label: string) =>
  ({ request: vi.fn(), label }) as unknown as EIP1193Provider;

// tracks the transport each chain currently has installed
const makeTransportMap = () => {
  const current: Record<number, Transport | null | undefined> = {};
  const setters: Record<number, (t: Transport | null) => void> = {};
  const calls: Array<[number, Transport | null]> = [];
  for (const chain of CHAINS) {
    setters[chain.id] = (t) => {
      current[chain.id] = t;
      calls.push([chain.id, t]);
    };
  }
  return { current, setters, calls };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createActiveConnectionListener', () => {
  it('installs the wallet transport only for the connection chain', async () => {
    const { current, setters } = makeTransportMap();
    const provider = makeProvider('A');
    getConnectionProviderMock.mockResolvedValue(provider);

    const listener = createActiveConnectionListener(CHAINS, setters);
    await listener(makeConnection(1, 'a'));

    expect(current[1]).toMatchObject({ provider });
    expect(current[10]).toBeNull();
  });

  it('clears all wallet transports for a null connection', async () => {
    const { current, setters } = makeTransportMap();
    getConnectionProviderMock.mockResolvedValue(makeProvider('A'));

    const listener = createActiveConnectionListener(CHAINS, setters);
    await listener(makeConnection(1, 'a'));
    await listener(null);

    expect(current[1]).toBeNull();
    expect(current[10]).toBeNull();
    expect(getConnectionProviderMock).toHaveBeenCalledTimes(1);
  });

  it('clears the previous wallet transport before the next provider resolves', async () => {
    const { current, setters } = makeTransportMap();
    let resolveProvider!: (p: EIP1193Provider) => void;
    getConnectionProviderMock
      .mockResolvedValueOnce(makeProvider('A'))
      .mockImplementationOnce(
        () => new Promise((resolve) => (resolveProvider = resolve)),
      );

    const listener = createActiveConnectionListener(CHAINS, setters);
    await listener(makeConnection(1, 'a'));

    const pending = listener(makeConnection(1, 'b'));
    // connection B's provider has not resolved yet, but A's transport is gone
    expect(current[1]).toBeNull();

    const providerB = makeProvider('B');
    resolveProvider(providerB);
    await pending;
    expect(current[1]).toMatchObject({ provider: providerB });
  });

  it('rejects a late resolution of an earlier invocation', async () => {
    const { current, setters } = makeTransportMap();
    let resolveSlow!: (p: EIP1193Provider) => void;
    const slowProvider = makeProvider('slow');
    const fastProvider = makeProvider('fast');
    getConnectionProviderMock
      .mockImplementationOnce(
        () => new Promise((resolve) => (resolveSlow = resolve)),
      )
      .mockResolvedValueOnce(fastProvider);

    const listener = createActiveConnectionListener(CHAINS, setters);
    const slow = listener(makeConnection(1, 'slow'));
    await listener(makeConnection(10, 'fast'));

    resolveSlow(slowProvider);
    await slow;

    // the obsolete invocation must not override the current connection
    expect(current[1]).toBeNull();
    expect(current[10]).toMatchObject({ provider: fastProvider });
  });

  it('keeps default transports when the connection has no suitable provider', async () => {
    const { current, setters } = makeTransportMap();
    getConnectionProviderMock.mockResolvedValue(null);

    const listener = createActiveConnectionListener(CHAINS, setters);
    await listener(makeConnection(1, 'a'));

    expect(current[1]).toBeNull();
    expect(current[10]).toBeNull();
  });
});
