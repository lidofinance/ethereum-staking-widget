import type { TOKENS } from '@lido-sdk/constants';
import { MATOMO_CLICK_EVENTS_TYPES } from 'config';
import type { BigNumber } from 'ethers';
import { TokensWithdrawable } from 'features/withdrawals/types/tokens-withdrawable';

export type GetWithdrawalRateParams = {
  amount: BigNumber;
  token: TOKENS.STETH | TOKENS.WSTETH;
  dexes: DexWithdrawalApi[];
};

export type RateCalculationResult = {
  rate: number;
  toReceive: BigNumber;
};

export type SingleWithdrawalRateResult = {
  rate: number | null;
  toReceive: BigNumber | null;
  isServiceAvailable: boolean;
};

export type DexWithdrawalApi = 'paraswap' | 'open-ocean' | 'one-inch';

export type DexWithdrawalIntegration = {
  title: string;
  fetcher: GetRateType;
  icon: React.FC;
  matomoEvent: MATOMO_CLICK_EVENTS_TYPES;
  link: (amount: BigNumber, token: TokensWithdrawable) => string;
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
