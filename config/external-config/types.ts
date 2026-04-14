import type { UseQueryResult } from '@tanstack/react-query';
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
  deprecated?: boolean;
  disabled?: boolean;
};

export type WithdrawalDexIntegration = 'cowswap' | 'cowsdk';

type MustIncludeAll<T extends string, U extends T[]> =
  Exclude<T, U[number]> extends never ? U : never;

export type WithdrawalDexIntegrationList = MustIncludeAll<
  WithdrawalDexIntegration,
  ['cowswap', 'cowsdk']
>;

export type ManifestConfig = {
  withdrawalDex: {
    integration: WithdrawalDexIntegration;
    enabled: boolean;
  };
  multiChainBanner: number[];
  earnVaults: EarnVaultConfigEntry[];
  earnVaultsBanner: {
    showOnStakeForm: boolean;
    showAfterStake: boolean;
  };
  featureFlags: {
    ledgerLiveL2?: boolean;
    disableSendCalls?: boolean;
    dgBannerEnabled?: boolean;
    dgWarningState?: boolean;
    rewardsMaintenance?: boolean;
    holidayDecorEnabled?: boolean;
    forceAllowance?: boolean;
    amountBannerEnabled?: boolean;
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
  EarnNew = '/earn-new',
}

export type ManifestConfigPage = `${ManifestConfigPageEnum}`;

export const ManifestConfigPageList = new Set<ManifestConfigPage>(
  Object.values(ManifestConfigPageEnum),
);

export type ExternalConfig = Omit<ManifestEntry, 'config'> &
  ManifestConfig & {
    fetchMeta: UseQueryResult<ManifestEntry>;
  };
