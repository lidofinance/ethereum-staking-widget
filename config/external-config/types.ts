import type { UseQueryResult } from '@tanstack/react-query';
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
    disableSendCalls?: boolean;
  };
  pages?: {
    [page in ManifestConfigPage]?: {
      shouldDisable?: boolean;
      sections?: [string, ...string[]];
    };
  };
};

export enum ManifestConfigPageEnum {
  Stake = '/',
  Wrap = '/wrap',
  Withdrawals = '/withdrawals',
  Rewards = '/rewards',
  Settings = '/settings',
  Referral = '/referral',
}

export type ManifestConfigPage = `${ManifestConfigPageEnum}`;

export const ManifestConfigPageList = new Set<ManifestConfigPage>(
  Object.values(ManifestConfigPageEnum),
);

export type ExternalConfig = Omit<ManifestEntry, 'config'> &
  ManifestConfig & {
    fetchMeta: UseQueryResult<ManifestEntry>;
  };
