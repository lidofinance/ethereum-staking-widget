export const STRATEGY_IMMUTABLE = {
  staleTime: Infinity,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

export const STRATEGY_CONSTANT = {
  staleTime: Infinity,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  refetchInterval: 10 * 60 * 1000, // 10 minutes
};

export const STRATEGY_LAZY = {
  staleTime: 2 * 60 * 1000, // 2 minutes
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  refetchInterval: 5 * 60 * 1000, // 5 minutes
};

// Runtime manifest: remote page/vault disables must reach already-open tabs
// without a reload, so the mounted query polls instead of only going stale
export const STRATEGY_MANIFEST = {
  ...STRATEGY_LAZY,
  refetchInterval: 60 * 1000, // 1 minute
};

export const STRATEGY_EAGER = {
  staleTime: 3000, // 3 seconds
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  refetchInterval: 10000, // 10 seconds
};
