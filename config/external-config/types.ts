import { UseQueryResult } from '@tanstack/react-query';
import type { DexWithdrawalApi } from 'features/withdrawals/request/withdrawal-rates';

export type Manifest = Record<string, ManifestEntry>;

export type ManifestEntry = {
  cid?: string;
  ens?: string;
  leastSafeVersion?: string;
  config: ManifestConfig;
};

export type ManifestConfig = {
  enabledWithdrawalDexes: DexWithdrawalApi[];
  multiChainBanner: number[];
  featureFlags: {
    ledgerLiveL2?: boolean;
  };
};

export type ExternalConfig = Omit<ManifestEntry, 'config'> &
  ManifestConfig & {
    fetchMeta: UseQueryResult<ManifestEntry>;
  };
