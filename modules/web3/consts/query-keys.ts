import type { QueryKey } from '@tanstack/react-query';

// The prefixes wagmi keys its reads under: `useBalance` and `useReadContract`
// (balances, allowances, vault and queue reads). A tx flow passes them in its
// `refetchScope` together with its feature scope, so a transaction whose
// outcome could not be read refreshes the account state without touching
// the manifest, geo, chart and history queries
export const ACCOUNT_READ_QUERY_KEYS: readonly QueryKey[] = [
  ['balance'],
  ['readContract'],
  ['readContracts'],
];
