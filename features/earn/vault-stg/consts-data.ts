import { ethAddress, getAddress } from 'viem';

/**
 * Framework-neutral stRATEGY constants — split out of `consts.tsx` so the
 * api server and `utils.ts` can import them without the icon/JSX chain
 * (`assets/earn` → styled-components). `consts.tsx` re-exports these.
 */
export const STG_COLLECTOR_CONFIG = {
  baseAssetFallback: getAddress(ethAddress),
  oracleUpdateInterval: 86400n,
  redeemHandlingInterval: 3600n,
} as const;

export const STG_STATS_ORIGIN = 'https://api.mellow.finance';
