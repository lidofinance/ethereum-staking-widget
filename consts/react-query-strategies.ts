export const STRATEGY_IMMUTABLE = {
  staleTime: Infinity,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

export const STRATEGY_CONSTANT = {
  staleTime: Infinity,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchInterval: 10 * 60 * 1000, // 10 minutes
};

export const STRATEGY_LAZY = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
};

export const STRATEGY_EAGER = {
  staleTime: 3000, // 3 seconds
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  refetchInterval: 10000, // 10 seconds
};
