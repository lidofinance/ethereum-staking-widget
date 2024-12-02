import type { DexWithdrawalApi } from 'features/withdrawals/request/withdrawal-rates';
import { SWRResponse } from 'swr';

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
  pages?: {
    [page in ManifestConfigPage]?: {
      deactivate?: boolean;
      sections?: [string, ...string[]];
    };
  };
};

export type ManifestConfigPage =
  | '/'
  | '/wrap'
  | '/withdrawals'
  | '/rewards'
  | '/settings'
  | '/referral';

export type ExternalConfig = Omit<ManifestEntry, 'config'> &
  ManifestConfig & {
    fetchMeta: SWRResponse<ManifestEntry>;
  };
