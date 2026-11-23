import {
  canReconnect,
  nextWalletResolveState,
  type WalletResolveEvent,
  type WalletResolveState,
} from '../use-wallet-resolving';

const run = (events: WalletResolveEvent[]): WalletResolveState =>
  events.reduce(nextWalletResolveState, 'unknown' as WalletResolveState);

const status = (value: string): WalletResolveEvent => ({
  type: 'status',
  status: value,
});

describe('nextWalletResolveState', () => {
  it('waits before mount, the server cannot know the wallet', () => {
    expect(run([status('disconnected')])).toBe('unknown');
  });

  it('settles at once without a wallet to reconnect', () => {
    expect(run([{ type: 'mounted', canReconnect: false }])).toBe('settled');
  });

  it('waits through the reconnect and settles once it ends', () => {
    const started: WalletResolveEvent[] = [
      { type: 'mounted', canReconnect: true },
      status('disconnected'),
    ];
    expect(run(started)).toBe('waiting');
    expect(run([...started, status('reconnecting')])).toBe('attempting');
    expect(
      run([...started, status('reconnecting'), status('disconnected')]),
    ).toBe('settled');
  });

  it('settles on connect', () => {
    expect(
      run([
        { type: 'mounted', canReconnect: true },
        status('reconnecting'),
        status('connected'),
      ]),
    ).toBe('settled');
  });

  it('gives up when no reconnect starts in time', () => {
    expect(
      run([{ type: 'mounted', canReconnect: true }, { type: 'startTimeout' }]),
    ).toBe('settled');
  });

  it('keeps waiting for a started reconnect until the hard cap', () => {
    const attempting: WalletResolveEvent[] = [
      { type: 'mounted', canReconnect: true },
      status('connecting'),
      { type: 'startTimeout' },
    ];
    expect(run(attempting)).toBe('attempting');
    expect(run([...attempting, { type: 'maxTimeout' }])).toBe('settled');
  });

  it('ignores a later manual connect once settled', () => {
    expect(
      run([{ type: 'mounted', canReconnect: false }, status('connecting')]),
    ).toBe('settled');
  });
});

describe('canReconnect', () => {
  const stubStorage = (store: Record<string, string> | Error) =>
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => {
          if (store instanceof Error) throw store;
          return store[key] ?? null;
        },
      },
    });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is true with accepted terms and a recent connector', () => {
    stubStorage({
      'reef-knot_accept-terms_n2': 'true',
      'wagmi.recentConnectorId': '"injected"',
    });
    expect(canReconnect()).toBe(true);
  });

  it.each([
    ['no keys', {}],
    ['terms only', { 'reef-knot_accept-terms_n2': 'true' }],
    ['connector only', { 'wagmi.recentConnectorId': '"injected"' }],
    [
      'terms not accepted',
      {
        'reef-knot_accept-terms_n2': 'false',
        'wagmi.recentConnectorId': '"injected"',
      },
    ],
  ])('is false with %s', (_name, store) => {
    stubStorage(store);
    expect(canReconnect()).toBe(false);
  });

  it('is false when storage is blocked', () => {
    stubStorage(new Error('SecurityError'));
    expect(canReconnect()).toBe(false);
  });
});
