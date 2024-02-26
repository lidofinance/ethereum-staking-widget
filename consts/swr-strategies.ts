import type { SWRConfiguration } from 'swr';

const MINUTE_MS = 1000 * 60;

type StrategyConfig<DataT = unknown> = Pick<
  SWRConfiguration<DataT>,
  | 'revalidateIfStale'
  | 'revalidateOnFocus'
  | 'revalidateOnReconnect'
  | 'refreshInterval'
  | 'focusThrottleInterval'
  | 'dedupingInterval'
>;

export const STRATEGY_IMMUTABLE: StrategyConfig = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export const STRATEGY_CONSTANT: StrategyConfig = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshInterval: 10 * MINUTE_MS,
};

export const STRATEGY_LAZY: StrategyConfig = {
  revalidateOnFocus: false,
  revalidateIfStale: true,
  revalidateOnReconnect: true,
  refreshInterval: 5 * MINUTE_MS,
};

export const STRATEGY_EAGER: StrategyConfig = {
  revalidateOnFocus: true,
  revalidateIfStale: true,
  revalidateOnReconnect: true,
  focusThrottleInterval: 10000,
  dedupingInterval: 3000,
};
