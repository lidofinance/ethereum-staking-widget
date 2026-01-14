import type { UseQueryResult } from '@tanstack/react-query';
import type { DexWithdrawalApi } from 'features/withdrawals/request/withdrawal-rates';
import type { EarnVaultKey } from 'features/earn/consts';

export type Manifest = Record<string, ManifestEntry>;

export type ManifestEntry = {
  cid?: string;
  ens?: string;
  leastSafeVersion?: string;
  config: ManifestConfig;
};

export type VaultAPYType = 'daily' | 'weekly' | 'weekly_moving_average';
type VaultAPY = {
  type?: VaultAPYType;
};

export type EarnVaultConfigEntry = {
  name: EarnVaultKey;
  deposit?: boolean;
  withdraw?: boolean;
  depositPauseReasonText?: string;
  withdrawPauseReasonText?: string;
  apy?: VaultAPY;
  showNew?: boolean;
};

export type ManifestConfig = {
  enabledWithdrawalDexes: DexWithdrawalApi[];
  multiChainBanner: number[];
  earnVaults: EarnVaultConfigEntry[];
  featureFlags: {
    ledgerLiveL2?: boolean;
    disableSendCalls?: boolean;
    dgBannerEnabled?: boolean;
    dgWarningState?: boolean;
    rewardsMaintenance?: boolean;
    holidayDecorEnabled?: boolean;
    forceAllowance?: {
      withdrawalRequest?: boolean;
    };
  };
  pages: {
    [page in ManifestConfigPage]?: {
      shouldDisable?: boolean;
      showNew?: boolean;
      sections?: [string, ...string[]];
    };
  };
  api: {
    validation: {
      version: string;
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
  Earn = '/earn',
}

export type ManifestConfigPage = `${ManifestConfigPageEnum}`;

export const ManifestConfigPageList = new Set<ManifestConfigPage>(
  Object.values(ManifestConfigPageEnum),
);

export type ExternalConfig = Omit<ManifestEntry, 'config'> &
  ManifestConfig & {
    fetchMeta: UseQueryResult<ManifestEntry>;
  };
