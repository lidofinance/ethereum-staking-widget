import { type StakeLimitFullInfo } from 'shared/hooks/useStakingLimitInfo';
import { TOKENS_TO_STAKE } from 'features/stake/shared/types';
import { LIMIT_LEVEL } from 'types';

export type StakeFormInput = {
  amount: bigint | null;
  token: TOKENS_TO_STAKE;
  referral: string | null;
};

export type StakeFormLoading = {
  isStethBalanceLoading: boolean;
  isSmartAccountLoading: boolean;
  isMaxGasPriceLoading: boolean;
  isEtherBalanceLoading: boolean;
  isWethBalanceLoading: boolean;
  isStakeableEtherLoading: boolean;
  isStakeableWethLoading: boolean;
};

export type StakeFormNetworkData = {
  etherBalance?: bigint;
  wethBalance?: bigint;
  isWethSupported: boolean;
  isSmartAccount?: boolean;
  stethBalance?: bigint;
  stakeableEther?: bigint;
  stakeableWeth?: bigint;
  stakingLimitInfo?: StakeLimitFullInfo;
  gasLimitEth?: bigint;
  gasLimitWeth?: bigint;
  gasCostEth?: bigint;
  gasCostWeth?: bigint;
  maxAmountEth?: bigint;
  maxAmountWeth?: bigint;
  loading: StakeFormLoading;
  revalidate: () => Promise<void>;
};

// network data plus the values resolved for the selected token
export type StakeFormDataContextValue = StakeFormNetworkData & {
  token: TOKENS_TO_STAKE;
  isWeth: boolean;
  stakeableAmount?: bigint;
  isStakeableAmountLoading: boolean;
  gasCost?: bigint;
  maxAmount?: bigint;
};

export type StakeFormValidationContext = {
  isWalletActive: boolean;
  stakingLimitLevel: LIMIT_LEVEL;
  currentStakeLimit: bigint;
  gasCostEth: bigint;
  gasCostWeth: bigint;
  etherBalance: bigint;
  wethBalance: bigint;
  isSmartAccount: boolean;
  shouldValidateEtherBalance: boolean;
};
