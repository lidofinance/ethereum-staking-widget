import { BigNumber } from 'ethers';
import { type StakeLimitFullInfo } from 'shared/hooks/useStakingLimitInfo';
import { LIMIT_LEVEL } from 'types';

export type StakeFormDataContextValue = StakeFormNetworkData;

export type StakeFormInput = {
  amount: BigNumber | null;
  referral: string | null;
};

export type StakeFormNetworkData = {
  etherBalance?: BigNumber;
  isMultisig?: boolean;
  stethBalance?: BigNumber;
  stakeableEther?: BigNumber;
  stakingLimitInfo?: StakeLimitFullInfo;
  gasLimit?: BigNumber;
  gasCost?: BigNumber;
  maxAmount?: BigNumber;
  revalidate: () => Promise<void>;
};

export type StakeFormValidationContext = {
  isWalletActive: boolean;
  stakingLimitLevel: LIMIT_LEVEL;
  currentStakeLimit: BigNumber;
  gasCost: BigNumber;
  etherBalance: BigNumber;
  isMultisig: boolean;
};
