import { useMemo, useSyncExternalStore } from 'react';
import {
  isAddress,
  isAddressEqual,
  isHash,
  type Address,
  type Hash,
} from 'viem';

/**
 * The slow stakes a user sent from this browser that the CCIP API may not
 * list yet: it picks a message up a little after the send is mined, and the
 * list would show nothing for the stake in between. Kept per chain and
 * account, persisted so a reload keeps them, dropped once the API lists the
 * message or after they age out
 */

export type PendingSlowStake = {
  messageId: Hash;
  chainId: number;
  address: Address;
  token: Address;
  amount: bigint;
  sendTxHash?: Hash;
  sendBlockNumber?: bigint;
  addedAt: number;
};

type AddPendingSlowStake = Omit<PendingSlowStake, 'addedAt'>;

const STORAGE_KEY = 'lido-l2-slow-stake-pending';
// A stake is through, or reported as failed, well within a day; a message
// the sources never listed is not worth a placeholder beyond that
export const PENDING_SLOW_STAKE_TTL_MS = 24 * 60 * 60 * 1000;

type Stored = {
  messageId: string;
  chainId: number;
  address: string;
  token: string;
  amount: string;
  sendTxHash?: string;
  sendBlockNumber?: string;
  addedAt: number;
};

const parse = (raw: string | null): PendingSlowStake[] => {
  if (!raw) return [];
  try {
    const list: unknown = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.flatMap((item: Partial<Stored>): PendingSlowStake[] => {
      if (
        !isHash(item.messageId ?? '') ||
        typeof item.chainId !== 'number' ||
        !isAddress(item.address ?? '', { strict: false }) ||
        !isAddress(item.token ?? '', { strict: false }) ||
        typeof item.amount !== 'string' ||
        typeof item.addedAt !== 'number'
      )
        return [];
      return [
        {
          messageId: item.messageId as Hash,
          chainId: item.chainId,
          address: item.address as Address,
          token: item.token as Address,
          amount: BigInt(item.amount),
          sendTxHash: isHash(item.sendTxHash ?? '')
            ? (item.sendTxHash as Hash)
            : undefined,
          sendBlockNumber:
            item.sendBlockNumber === undefined
              ? undefined
              : BigInt(item.sendBlockNumber),
          addedAt: item.addedAt,
        },
      ];
    });
  } catch {
    return [];
  }
};

const serialize = (entries: PendingSlowStake[]): string =>
  JSON.stringify(
    entries.map((entry): Stored => ({
      ...entry,
      amount: entry.amount.toString(),
      sendBlockNumber: entry.sendBlockNumber?.toString(),
    })),
  );

// Browser storage can be absent or throw (private mode, blocked site data):
// then the list lives for the page only
const readStorage = (): PendingSlowStake[] => {
  if (typeof window === 'undefined') return [];
  try {
    return parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
};

const writeStorage = (entries: PendingSlowStake[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, serialize(entries));
  } catch {
    // kept in memory only
  }
};

const EMPTY: PendingSlowStake[] = [];
let entries: PendingSlowStake[] | undefined;
const listeners = new Set<() => void>();

const isFresh = (entry: PendingSlowStake, now: number) =>
  now - entry.addedAt <= PENDING_SLOW_STAKE_TTL_MS;

const getEntries = (): PendingSlowStake[] => {
  if (entries === undefined) entries = readStorage();
  return entries;
};

const setEntries = (next: PendingSlowStake[]) => {
  entries = next;
  writeStorage(next);
  listeners.forEach((listener) => listener());
};

export const addPendingSlowStake = (entry: AddPendingSlowStake) => {
  const now = Date.now();
  const rest = getEntries().filter(
    (item) => item.messageId !== entry.messageId && isFresh(item, now),
  );
  setEntries([{ ...entry, addedAt: now }, ...rest]);
};

export const removePendingSlowStake = (messageId: Hash) => {
  const current = getEntries();
  const next = current.filter((item) => item.messageId !== messageId);
  if (next.length !== current.length) setEntries(next);
};

type PendingSlowStakeFilter = { chainId: number; address: Address | undefined };

// the user's pending stakes on the chain, newest first
export const getPendingSlowStakes = (
  { chainId, address }: PendingSlowStakeFilter,
  now = Date.now(),
): PendingSlowStake[] => {
  if (!address) return EMPTY;
  return getEntries()
    .filter(
      (item) =>
        item.chainId === chainId &&
        isAddressEqual(item.address, address) &&
        isFresh(item, now),
    )
    .sort((a, b) => b.addedAt - a.addedAt);
};

export const subscribePendingSlowStakes = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// for tests
export const resetPendingSlowStakes = () => {
  entries = undefined;
};

const getServerSnapshot = () => EMPTY;

export const usePendingSlowStakes = (filter: PendingSlowStakeFilter) => {
  const all = useSyncExternalStore(
    subscribePendingSlowStakes,
    getEntries,
    getServerSnapshot,
  );
  const { chainId, address } = filter;
  // the store hands out one list; the view of it is memoised per filter
  return useMemo(
    () => (all === EMPTY ? EMPTY : getPendingSlowStakes({ chainId, address })),
    [all, chainId, address],
  );
};
