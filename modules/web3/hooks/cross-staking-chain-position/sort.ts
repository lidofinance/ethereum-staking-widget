import type { PositionConverters } from './use-position-converters';
import type { CrossStakingChainPositionToken } from './use-cross-chain-balances';

export type PositionSort = 'non-zero' | 'eth' | 'usd';

type ConverterStatuses = PositionConverters['status'];

type SortSpec = {
  // the token field the sort reads; null when it reads only the balance
  field: 'ethValue' | 'usdValue' | null;
  // converters that produce that field
  dependencies: readonly (keyof ConverterStatuses)[];
};

const SORT_SPECS: Record<PositionSort, SortSpec> = {
  'non-zero': { field: null, dependencies: [] },
  eth: { field: 'ethValue', dependencies: ['eth'] },
  usd: { field: 'usdValue', dependencies: ['eth', 'usd'] },
};

export type SortGate = {
  isLoading: boolean;
  error: Error | null;
};

/**
 * Converters gate a sort only while a token is actually missing its sort
 * value. Zero balances are valued at zero without any rate, so a rate that
 * only non-held tokens need is neither waited on nor surfaced as an error.
 */
export const getSortGate = (
  tokens: readonly CrossStakingChainPositionToken[],
  sort: PositionSort,
  status: ConverterStatuses,
): SortGate => {
  const { field, dependencies } = SORT_SPECS[sort];
  const isComplete =
    field === null || tokens.every((token) => token[field] !== undefined);
  if (isComplete) return { isLoading: false, error: null };

  const sources = dependencies.map((key) => status[key]);
  if (sources.some(({ isLoading }) => isLoading)) {
    return { isLoading: true, error: null };
  }
  // a value is missing and nothing is loading: a converter failed, or never
  // ran (disabled); the latter falls through to the no-value tail below
  return {
    isLoading: false,
    error: sources.find(({ error }) => error)?.error ?? null,
  };
};

type Comparator = (
  a: CrossStakingChainPositionToken,
  b: CrossStakingChainPositionToken,
) => number;

// descending, a missing value goes last
const byDesc = <T extends bigint | number>(
  a: T | undefined,
  b: T | undefined,
) => {
  if (a === b) return 0;
  if (a === undefined) return 1;
  if (b === undefined) return -1;
  return a > b ? -1 : 1;
};

// only moves zero balances to the end
const byNonZero: Comparator = (a, b) =>
  Number(a.balance === 0n) - Number(b.balance === 0n);

const COMPARATORS: Record<PositionSort, Comparator> = {
  'non-zero': byNonZero,
  eth: (a, b) => byDesc(a.ethValue, b.ethValue) || byNonZero(a, b),
  usd: (a, b) => byDesc(a.usdValue, b.usdValue) || byNonZero(a, b),
};

// stable: ties keep chain/token config order
export const sortPositionTokens = (
  tokens: readonly CrossStakingChainPositionToken[],
  sort: PositionSort,
) => [...tokens].sort(COMPARATORS[sort]);
