import { FetcherError } from 'utils/fetcherError';

const SNAPSHOT_KEY_PREFIX = 'lido-portfolio-snapshot:v1';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
// history pages are large and the storage quota is a few megabytes
const MAX_WALLETS = 3;
const LIMIT_HTTP_STATUS = 429;

export type SnapshotScope = 'positions' | 'rewards' | 'transactions';

type SnapshotData = { updatedAt: number; stale?: true };
type StoredSnapshot = { savedAt: number; data: SnapshotData };

type SnapshotStorage = Pick<
  Storage,
  'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'
>;

// each answer carries its list under this field
const LIST_FIELD: Record<SnapshotScope, string> = {
  positions: 'tokens',
  rewards: 'rewards',
  transactions: 'transactions',
};

// storage may be blocked, e.g. in a private window
const getBrowserStorage = (): SnapshotStorage | null => {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
};

const getScopePrefix = (scope: SnapshotScope) =>
  `${SNAPSHOT_KEY_PREFIX}:${scope}:`;
const getSnapshotKey = (scope: SnapshotScope, address: string) =>
  `${getScopePrefix(scope)}${address.toLowerCase()}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const parseStoredSnapshot = (
  scope: SnapshotScope,
  storedText: string | null,
): StoredSnapshot | null => {
  if (!storedText) return null;
  try {
    const parsedSnapshot: unknown = JSON.parse(storedText);
    if (!isRecord(parsedSnapshot) || typeof parsedSnapshot.savedAt !== 'number')
      return null;
    const { data } = parsedSnapshot;
    if (!isRecord(data) || typeof data.updatedAt !== 'number') return null;
    if (!Array.isArray(data[LIST_FIELD[scope]])) return null;
    return parsedSnapshot as StoredSnapshot;
  } catch {
    return null;
  }
};

const getScopeKeys = (scope: SnapshotScope, storage: SnapshotStorage) => {
  const scopePrefix = getScopePrefix(scope);
  const snapshotKeys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const storageKey = storage.key(index);
    if (storageKey?.startsWith(scopePrefix)) snapshotKeys.push(storageKey);
  }
  return snapshotKeys;
};

// keeps the most recent wallets, drops the rest and anything unreadable
const pruneSnapshots = (
  scope: SnapshotScope,
  storage: SnapshotStorage,
  walletsToKeep: number,
) => {
  const savedSnapshots = getScopeKeys(scope, storage)
    .map((snapshotKey) => ({
      snapshotKey,
      savedAt:
        parseStoredSnapshot(scope, storage.getItem(snapshotKey))?.savedAt ?? 0,
    }))
    .sort(
      (firstSnapshot, secondSnapshot) =>
        secondSnapshot.savedAt - firstSnapshot.savedAt,
    );
  for (const { snapshotKey } of savedSnapshots.slice(walletsToKeep))
    storage.removeItem(snapshotKey);
};

export const saveSnapshot = <T extends SnapshotData>(
  scope: SnapshotScope,
  address: string,
  data: T,
  storage: SnapshotStorage | null = getBrowserStorage(),
  now = Date.now(),
): void => {
  if (!storage) return;
  const serializedSnapshot = JSON.stringify({ savedAt: now, data });
  try {
    storage.setItem(getSnapshotKey(scope, address), serializedSnapshot);
    pruneSnapshots(scope, storage, MAX_WALLETS);
  } catch {
    // over the quota: make room once, then give up quietly
    try {
      pruneSnapshots(scope, storage, 0);
      storage.setItem(getSnapshotKey(scope, address), serializedSnapshot);
    } catch {
      return;
    }
  }
};

export const readSnapshot = <T extends SnapshotData>(
  scope: SnapshotScope,
  address: string,
  storage: SnapshotStorage | null = getBrowserStorage(),
  now = Date.now(),
): T | null => {
  if (!storage) return null;
  try {
    const snapshotKey = getSnapshotKey(scope, address);
    const storedSnapshot = parseStoredSnapshot(
      scope,
      storage.getItem(snapshotKey),
    );
    if (!storedSnapshot) return null;
    if (now - storedSnapshot.savedAt > MAX_AGE_MS) {
      // an expired snapshot does not stay in the browser
      storage.removeItem(snapshotKey);
      return null;
    }
    return storedSnapshot.data as T;
  } catch {
    return null;
  }
};

const SNAPSHOT_SCOPES: SnapshotScope[] = [
  'positions',
  'rewards',
  'transactions',
];

// a disconnected wallet leaves no balances or history in the browser
export const clearSnapshots = (
  storage: SnapshotStorage | null = getBrowserStorage(),
): void => {
  if (!storage) return;
  try {
    for (const scope of SNAPSHOT_SCOPES) pruneSnapshots(scope, storage, 0);
  } catch {
    return;
  }
};

export const isLimitError = (error: unknown): boolean =>
  error instanceof FetcherError && error.status === LIMIT_HTTP_STATUS;

// a bad request stays an error; an outage or a limit may show older data
const canUseSnapshot = (error: unknown) =>
  !(error instanceof FetcherError) ||
  error.status === LIMIT_HTTP_STATUS ||
  error.status >= 500;

// answers a failed load with the last answer this browser saw, marked stale
export const withBrowserSnapshot = async <T extends SnapshotData>(
  scope: SnapshotScope,
  address: string,
  load: () => Promise<T>,
  storage: SnapshotStorage | null = getBrowserStorage(),
): Promise<T> => {
  try {
    const loadedAnswer = await load();
    // a stale server answer is no newer than what is already kept
    if (!loadedAnswer.stale)
      saveSnapshot(scope, address, loadedAnswer, storage);
    return loadedAnswer;
  } catch (error) {
    const snapshot = canUseSnapshot(error)
      ? readSnapshot<T>(scope, address, storage)
      : null;
    if (!snapshot) throw error;
    return { ...snapshot, stale: true };
  }
};
