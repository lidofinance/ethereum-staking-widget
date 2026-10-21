import type { Address, Hash } from 'viem';
import {
  PENDING_SLOW_STAKE_TTL_MS,
  addPendingSlowStake,
  getPendingSlowStakes,
  removePendingSlowStake,
  resetPendingSlowStakes,
  subscribePendingSlowStakes,
} from '../slow-stake-pending-store';

const KEY = 'lido-l2-slow-stake-pending';
const ACCOUNT: Address = '0x00000000000000000000000000000000000000aa';
const OTHER: Address = '0x00000000000000000000000000000000000000bb';
const WETH: Address = '0x4200000000000000000000000000000000000006';
const ID_1: Hash =
  '0x1111111111111111111111111111111111111111111111111111111111111111';
const ID_2: Hash =
  '0x2222222222222222222222222222222222222222222222222222222222222222';
const P = 10n ** 18n;

const store = new Map<string, string>();
const localStorageStub = {
  getItem: vi.fn((key: string) => store.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => {
    store.set(key, value);
  }),
};

const entry = (messageId: Hash, overrides = {}) => ({
  messageId,
  chainId: 8453,
  address: ACCOUNT,
  token: WETH,
  amount: 2n * P,
  ...overrides,
});

beforeAll(() => {
  vi.stubGlobal('window', {});
  vi.stubGlobal('localStorage', localStorageStub);
});
afterAll(() => {
  vi.unstubAllGlobals();
});
beforeEach(() => {
  store.clear();
  resetPendingSlowStakes();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-21T12:00:00Z'));
});
afterEach(() => {
  vi.useRealTimers();
});

describe('pending slow stake store', () => {
  it('keeps a stake per chain and account, newest first', () => {
    addPendingSlowStake(entry(ID_1));
    vi.advanceTimersByTime(1000);
    addPendingSlowStake(entry(ID_2, { sendBlockNumber: 5n }));
    const pending = getPendingSlowStakes({ chainId: 8453, address: ACCOUNT });
    expect(pending.map((item) => item.messageId)).toEqual([ID_2, ID_1]);
    expect(pending[0]).toMatchObject({ amount: 2n * P, sendBlockNumber: 5n });
    expect(getPendingSlowStakes({ chainId: 10, address: ACCOUNT })).toEqual([]);
    expect(getPendingSlowStakes({ chainId: 8453, address: OTHER })).toEqual([]);
    expect(getPendingSlowStakes({ chainId: 8453, address: undefined })).toEqual(
      [],
    );
  });

  it('matches the account whatever its casing', () => {
    addPendingSlowStake(entry(ID_1));
    expect(
      getPendingSlowStakes({
        chainId: 8453,
        address: ACCOUNT.toUpperCase().replace('0X', '0x') as Address,
      }),
    ).toHaveLength(1);
  });

  it('survives a reload through storage, bigints included', () => {
    addPendingSlowStake(entry(ID_1, { sendBlockNumber: 7n }));
    resetPendingSlowStakes();
    const [restored] = getPendingSlowStakes({
      chainId: 8453,
      address: ACCOUNT,
    });
    expect(restored).toMatchObject({
      messageId: ID_1,
      amount: 2n * P,
      sendBlockNumber: 7n,
    });
  });

  it('ignores a malformed stored list', () => {
    store.set(KEY, JSON.stringify([{ messageId: 'nope', chainId: 8453 }, 42]));
    expect(getPendingSlowStakes({ chainId: 8453, address: ACCOUNT })).toEqual(
      [],
    );
    store.set(KEY, '{not json');
    resetPendingSlowStakes();
    expect(getPendingSlowStakes({ chainId: 8453, address: ACCOUNT })).toEqual(
      [],
    );
  });

  it('forgets a stake on removal and notifies', () => {
    const listener = vi.fn();
    const unsubscribe = subscribePendingSlowStakes(listener);
    addPendingSlowStake(entry(ID_1));
    removePendingSlowStake(ID_1);
    expect(getPendingSlowStakes({ chainId: 8453, address: ACCOUNT })).toEqual(
      [],
    );
    expect(listener).toHaveBeenCalledTimes(2);
    // removing what is not there changes nothing
    removePendingSlowStake(ID_1);
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });

  it('drops a stake after the day it is given', () => {
    addPendingSlowStake(entry(ID_1));
    vi.advanceTimersByTime(PENDING_SLOW_STAKE_TTL_MS - 1000);
    expect(
      getPendingSlowStakes({ chainId: 8453, address: ACCOUNT }),
    ).toHaveLength(1);
    vi.advanceTimersByTime(2000);
    expect(getPendingSlowStakes({ chainId: 8453, address: ACCOUNT })).toEqual(
      [],
    );
    // and is swept out of storage on the next add
    addPendingSlowStake(entry(ID_2));
    expect(JSON.parse(store.get(KEY) ?? '[]')).toHaveLength(1);
  });

  it('keeps the list when storage is unavailable', () => {
    localStorageStub.setItem.mockImplementationOnce(() => {
      throw new Error('QuotaExceededError');
    });
    addPendingSlowStake(entry(ID_1));
    expect(
      getPendingSlowStakes({ chainId: 8453, address: ACCOUNT }),
    ).toHaveLength(1);
  });
});
