import { FetcherError } from 'utils/fetcherError';

import {
  clearSnapshots,
  isLimitError,
  readSnapshot,
  saveSnapshot,
  withBrowserSnapshot,
} from '../browser-snapshot';

const DAY = 24 * 60 * 60 * 1000;
const WALLET = '0xAbCdEf0123456789aBcDeF0123456789AbCdEf01';

const makeStorage = (quota = Infinity) => {
  const items = new Map<string, string>();
  return {
    items,
    get length() {
      return items.size;
    },
    key: (index: number) => [...items.keys()][index] ?? null,
    getItem: (key: string) => items.get(key) ?? null,
    removeItem: (key: string) => void items.delete(key),
    setItem: (key: string, value: string) => {
      const others = [...items].filter(([name]) => name !== key);
      const size = others.reduce((sum, [, text]) => sum + text.length, 0);
      if (size + value.length > quota) throw new Error('QuotaExceededError');
      items.set(key, value);
    },
  };
};

const positions = (updatedAt = 1) => ({
  tokens: [{ id: 'eth' }],
  dataIncomplete: false,
  updatedAt,
});

describe('saveSnapshot and readSnapshot', () => {
  it('reads back what was saved, whatever the address case', () => {
    const storage = makeStorage();
    saveSnapshot('positions', WALLET, positions(7), storage);
    expect(readSnapshot('positions', WALLET.toLowerCase(), storage)).toEqual(
      positions(7),
    );
  });

  it('keeps scopes and wallets apart', () => {
    const storage = makeStorage();
    saveSnapshot('positions', '0xa', positions(), storage);
    expect(readSnapshot('rewards', '0xa', storage)).toBeNull();
    expect(readSnapshot('positions', '0xb', storage)).toBeNull();
  });

  it('forgets a snapshot after a day', () => {
    const storage = makeStorage();
    saveSnapshot('positions', '0xa', positions(), storage, 0);
    expect(readSnapshot('positions', '0xa', storage, DAY)).not.toBeNull();
    expect(readSnapshot('positions', '0xa', storage, DAY + 1)).toBeNull();
  });

  it('removes an expired snapshot from the storage', () => {
    const storage = makeStorage();
    saveSnapshot('positions', '0xa', positions(), storage, 0);
    readSnapshot('positions', '0xa', storage, DAY + 1);
    expect(storage.length).toBe(0);
  });

  it('keeps only the three most recent wallets of a scope', () => {
    const storage = makeStorage();
    ['0x1', '0x2', '0x3', '0x4'].forEach((wallet, index) =>
      saveSnapshot('positions', wallet, positions(), storage, index),
    );
    saveSnapshot('rewards', '0x1', { rewards: [], updatedAt: 1 }, storage, 9);
    expect(readSnapshot('positions', '0x1', storage, 10)).toBeNull();
    expect(readSnapshot('positions', '0x2', storage, 10)).not.toBeNull();
    expect(readSnapshot('positions', '0x4', storage, 10)).not.toBeNull();
    expect(readSnapshot('rewards', '0x1', storage, 10)).not.toBeNull();
  });

  it.each([
    ['not JSON', '{oops'],
    ['no data', JSON.stringify({ savedAt: 1 })],
    ['no list', JSON.stringify({ savedAt: 1, data: { updatedAt: 1 } })],
    [
      'no time',
      JSON.stringify({ savedAt: 1, data: { tokens: [], updatedAt: 'x' } }),
    ],
  ])('ignores a damaged entry: %s', (_name, raw) => {
    const storage = makeStorage();
    storage.setItem('lido-portfolio-snapshot:v1:positions:0xa', raw);
    expect(readSnapshot('positions', '0xa', storage, 2)).toBeNull();
  });

  it('makes room when the storage is full, and never throws', () => {
    const storage = makeStorage(150);
    saveSnapshot('positions', '0x1', positions(), storage, 1);
    saveSnapshot('positions', '0x2', positions(), storage, 2);
    expect(readSnapshot('positions', '0x2', storage, 3)).not.toBeNull();
    expect(readSnapshot('positions', '0x1', storage, 3)).toBeNull();

    const tiny = makeStorage(10);
    expect(() =>
      saveSnapshot('positions', '0x1', positions(), tiny),
    ).not.toThrow();
    expect(() =>
      saveSnapshot('positions', '0x1', positions(), null),
    ).not.toThrow();
    expect(readSnapshot('positions', '0x1', null)).toBeNull();
  });
});

describe('clearSnapshots', () => {
  it('removes every saved answer and nothing else', () => {
    const storage = makeStorage();
    saveSnapshot('positions', '0xa', positions(), storage);
    saveSnapshot('rewards', '0xa', { rewards: [], updatedAt: 1 }, storage);
    saveSnapshot(
      'transactions',
      '0xb',
      { transactions: [], nextCursor: null, updatedAt: 1 },
      storage,
    );
    storage.setItem('wagmi.store', 'kept');
    clearSnapshots(storage);
    expect([...storage.items.keys()]).toEqual(['wagmi.store']);
    expect(() => clearSnapshots(null)).not.toThrow();
  });
});

describe('withBrowserSnapshot', () => {
  it('saves a good answer and returns it as is', async () => {
    const storage = makeStorage();
    const data = positions(5);
    await expect(
      withBrowserSnapshot('positions', '0xa', async () => data, storage),
    ).resolves.toBe(data);
    expect(readSnapshot('positions', '0xa', storage)).toEqual(data);
  });

  it.each([
    ['the request limit', new FetcherError('limit', 429)],
    ['an outage', new FetcherError('down', 503)],
    ['a network failure', new TypeError('Failed to fetch')],
  ])('answers %s with the saved answer, marked stale', async (_name, error) => {
    const storage = makeStorage();
    saveSnapshot('positions', '0xa', positions(5), storage);
    await expect(
      withBrowserSnapshot(
        'positions',
        '0xa',
        () => Promise.reject(error),
        storage,
      ),
    ).resolves.toEqual({ ...positions(5), stale: true });
  });

  it('keeps a bad request an error', async () => {
    const storage = makeStorage();
    saveSnapshot('positions', '0xa', positions(), storage);
    const error = new FetcherError('Invalid address', 422);
    await expect(
      withBrowserSnapshot(
        'positions',
        '0xa',
        () => Promise.reject(error),
        storage,
      ),
    ).rejects.toBe(error);
  });

  it('fails as before when nothing was saved', async () => {
    const error = new FetcherError('down', 503);
    await expect(
      withBrowserSnapshot(
        'positions',
        '0xa',
        () => Promise.reject(error),
        makeStorage(),
      ),
    ).rejects.toBe(error);
  });

  it('does not overwrite its copy with a stale server answer', async () => {
    const storage = makeStorage();
    saveSnapshot('positions', '0xa', positions(9), storage);
    const stale = { ...positions(3), stale: true as const };
    await withBrowserSnapshot('positions', '0xa', async () => stale, storage);
    expect(readSnapshot('positions', '0xa', storage)).toEqual(positions(9));
  });
});

describe('isLimitError', () => {
  it('is true for HTTP 429 only', () => {
    expect(isLimitError(new FetcherError('limit', 429))).toBe(true);
    expect(isLimitError(new FetcherError('down', 503))).toBe(false);
    expect(isLimitError(new Error('x'))).toBe(false);
    expect(isLimitError(null)).toBe(false);
  });
});
