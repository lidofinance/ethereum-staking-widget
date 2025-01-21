import { type StakeLimitFullInfo } from 'shared/hooks/useStakingLimitInfo';
import { LIMIT_LEVEL } from 'types';

export type StakeFormDataContextValue = StakeFormNetworkData;

export type StakeFormInput = {
  amount: bigint | null;
  referral: string | null;
};

export type StakeFormLoading = {
  isStethBalanceLoading: boolean;
  isSmartAccountLoading: boolean;
  isMaxGasPriceLoading: boolean;
  isEtherBalanceLoading: boolean;
  isStakeableEtherLoading: boolean;
};

export type StakeFormNetworkData = {
  etherBalance?: bigint;
  isSmartAccount?: boolean;
  stethBalance?: bigint;
  stakeableEther?: bigint;
  stakingLimitInfo?: StakeLimitFullInfo;
  gasLimit?: bigint;
  gasCost?: bigint;
  maxAmount?: bigint;
  loading: StakeFormLoading;
  revalidate: () => Promise<void>;
};

export type StakeFormValidationContext = {
  isWalletActive: boolean;
  stakingLimitLevel: LIMIT_LEVEL;
  currentStakeLimit: bigint;
  gasCost: bigint;
  etherBalance: bigint;
  isSmartAccount: boolean;
  shouldValidateEtherBalance: boolean;
};
