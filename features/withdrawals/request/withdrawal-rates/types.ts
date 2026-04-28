import type { ManifestConfigDex } from 'config/external-config/types';
import type { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';
import type { TOKENS_TO_WITHDRAWLS } from 'features/withdrawals/types/tokens-withdrawable';

export type { ManifestConfigDex } from 'config/external-config';

export type GetWithdrawalRateParams = {
  amount: bigint;
  token: TOKENS_TO_WITHDRAWLS;
  dexes: ManifestConfigDex[];
};

export type SingleWithdrawalRateResult = {
  rate: number | null;
  toReceive: bigint | null;
};

export type DexWithdrawalIntegration = {
  title: string;
  fetcher: GetRateType;
  icon: React.FC;
  matomoEvent: MATOMO_CLICK_EVENTS_TYPES;
  link: (amount: bigint, token: TOKENS_TO_WITHDRAWLS) => string;
};

export type DexWithdrawalIntegrationMap = Record<
  ManifestConfigDex,
  DexWithdrawalIntegration
>;

export type GetRateType = (
  params: GetWithdrawalRateParams,
) => Promise<SingleWithdrawalRateResult>;

export type GetWithdrawalRateResult = (SingleWithdrawalRateResult &
  DexWithdrawalIntegration)[];
