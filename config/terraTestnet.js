export const CONCURRENCY_LIMIT = 5;
export const TERRA_NODE_URL = 'https://bombay-fcd.terra.dev/';
export const STAKERS_ADDRESS = 'terra1afl97jcp6qagtnjjql9pjrzrdrvja6k8803935';
export const HUB_CONTRACT = 'terra1rsq5m44sw42gs8yzavmknq220cfxfmhhv06fg3';
export const VALIDATORS_REGISTRY_CONTRACT =
  'terra1wajz0cvwndqa7c3slneh2tmxv8deh5z9yn04th';
export const CRON_JOB = '*/5 * * * *';
export const MAX_REQUESTS_PER_RUN = 10;
export const TAIL_LENGTH = 1 * 24 * 6;
export const DEFAULT_STAKERS = {
  count: 1,
  lastCounted: 'terra1p0d7ralahhwrla490guzmulf5ldqu3c047ex57',
};
export const DEFAULT_CLAIMS = {
  amount: 5277,
  lastBlock: { height: 5902925, time: '2021-09-28T13:47:14.000Z' },
  tail: [
    {
      amount: 1235,
      block: {
        height: 5902297,
        time: 1632833139000,
      },
      lunaPrice: 35.32713371340593,
      totalStaked: 2000000,
    },
    {
      amount: 1941,
      block: {
        height: 5902617,
        time: 1632835023000,
      },
      lunaPrice: 35.35273215891364,
      totalStaked: 2000000,
    },
    {
      amount: 969,
      block: {
        height: 5902771,
        time: 1632835929000,
      },
      lunaPrice: 35.61302897693144,
      totalStaked: 2000000,
    },
    {
      amount: 1132,
      block: {
        height: 5902925,
        time: 1632836834000,
      },
      lunaPrice: 35.555095048729164,
      totalStaked: 2000000,
    },
  ],
};
export const ST_LUNA_COUNT_DAYS = 7;
export const ST_LUNA_APR_CACHE_MS = 5 * 60 * 1000;
export const STORAGE_KEY_PREFIX = '_testnet_';
export const VALIDATORS_CACHE_TIME_MS = 5 * 60 * 1000;
export const VALIDATORS_CACHE_KEY = 'terraValidatorsTestnet';
