import type { TOKENS_TO_STAKE } from 'features/stake/shared/types';
import type { ValidationContextByToken } from 'features/stake/shared/validation-context-by-token';
import type { L2SlowStakeFee, L2SlowStakeLimits } from 'modules/l2-staking';
import type { L2StakeLane } from './lane';

export type L2StakeFormInputType = {
  amount: bigint | null;
  token: TOKENS_TO_STAKE;
  referral: string | null;
};

export type L2StakeFormValidatedInputType = {
  amount: bigint;
  token: TOKENS_TO_STAKE;
  referral: string | null;
};

export type L2StakeFormDataContextValue = Pick<
  L2StakeFormNetworkData,
  'loading' | 'isWethSupported'
> & {
  token: TOKENS_TO_STAKE;
  isWeth: boolean;
  // the lane the entered amount goes to, see resolveL2StakeLane
  lane: L2StakeLane;
  isFastLane: boolean;
  isSlowLane: boolean;
  // the CCIP quote for the entered amount, on the slow lane only
  slowStakeFee?: L2SlowStakeFee;
  // values resolved for the selected token
  stakeableAmount?: bigint;
  isStakeableAmountLoading: boolean;
  maxAmount?: bigint;
  gasCost?: bigint;
  shouldShowUnlockRequirement: boolean;
};

export type L2StakeFormValidationContext = {
  isWalletActive: boolean;
  isSmartAccount: boolean;
  // which lanes the chain offers right now; the resolver routes by them
  isFastLaneAvailable: boolean;
  isSlowLaneAvailable: boolean;
  // fast lane
  gasCostEth: bigint;
  gasCostWeth: bigint;
  // slow lane: the L2 gas, and a quote of the CCIP cap plus return budget
  // the send fronts in value, for the amount being validated
  gasCostEthSlow: bigint;
  gasCostWethSlow: bigint;
  fetchSlowStakeFrontedFee?: (amount: bigint) => Promise<bigint>;
  // undefined only while the bucket cannot be read on the current SDK chain
  slowStakeLimits?: L2SlowStakeLimits;
  etherBalance: bigint;
  wethBalance: bigint;
  // undefined only while the pool cannot be read on the current SDK chain
  // (the wallet sits on another chain); never a stub
  etherLiquidity?: bigint;
  etherLiquidityTarget?: bigint;
  shouldValidateEtherBalance: boolean;
  chainId: number;
};

export type L2StakeFormValidationContextByToken =
  ValidationContextByToken<L2StakeFormValidationContext>;

export type L2StakeFormNetworkData = {
  wstethBalance?: bigint;
  etherBalance?: bigint;
  wethBalance?: bigint;
  isWethSupported: boolean;
  isSmartAccount?: boolean;
  stakeableEther?: bigint;
  stakeableWeth?: bigint;
  fastStakeLiquidityEth?: bigint;
  slowStakeLimits?: L2SlowStakeLimits;
  gasCostEth?: bigint;
  gasCostWeth?: bigint;
  gasCostEthSlow?: bigint;
  gasCostWethSlow?: bigint;
  gasLimitEth?: bigint;
  gasLimitWeth?: bigint;
  gasLimitEthSlow?: bigint;
  gasLimitWethSlow?: bigint;
  maxAmountEth?: bigint;
  maxAmountWeth?: bigint;
  loading: {
    isWstethBalanceLoading: boolean;
    isSmartAccountLoading: boolean;
    isMaxGasPriceLoading: boolean;
    isEtherBalanceLoading: boolean;
    isWethBalanceLoading: boolean;
    isFastStakeLiquidityLoading: boolean;
    isSlowStakeLimitsLoading: boolean;
    isStakeableEtherLoading: boolean;
    isStakeableWethLoading: boolean;
  };
  revalidate: () => Promise<void>;
};
