import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';
import { TOKENS_TO_WITHDRAWLS } from 'features/withdrawals/types/tokens-withdrawable';

export type GetWithdrawalRateParams = {
  amount: bigint;
  token: TOKENS_TO_WITHDRAWLS;
  dexes: DexWithdrawalApi[];
};

export type SingleWithdrawalRateResult = {
  rate: number | null;
  toReceive: bigint | null;
};

export type DexWithdrawalApi =
  | 'paraswap'
  | 'open-ocean'
  | 'one-inch'
  | 'bebop'
  | 'jumper';

export type DexWithdrawalIntegration = {
  title: string;
  fetcher: GetRateType;
  icon: React.FC;
  matomoEvent: MATOMO_CLICK_EVENTS_TYPES;
  link: (amount: bigint, token: TOKENS_TO_WITHDRAWLS) => string;
};

export type DexWithdrawalIntegrationMap = Record<
  DexWithdrawalApi,
  DexWithdrawalIntegration
>;

export type GetRateType = (
  params: GetWithdrawalRateParams,
) => Promise<SingleWithdrawalRateResult>;

export type GetWithdrawalRateResult = (SingleWithdrawalRateResult &
  DexWithdrawalIntegration)[];
