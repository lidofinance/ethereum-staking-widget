import { BigNumber } from 'ethers';
import { type StakeLimitFullInfo } from 'shared/hooks/useStakingLimitInfo';

export type StakeFormDataContextValue = StakeFormNetworkData;

export type StakeFormInput = {
  amount: BigNumber | null;
  referral: string | null;
};

export type StakeFormNetworkData = {
  etherBalance?: BigNumber;
  stakeableEther?: BigNumber;
  stakingLimitInfo?: StakeLimitFullInfo;
  gasLimit?: BigNumber;
  gasCost?: BigNumber;
  maxAmount?: BigNumber;
  revalidate: () => Promise<void>;
};

export type StakeFormValidationContext = {
  active: boolean;
  maxAmount: BigNumber;
};
