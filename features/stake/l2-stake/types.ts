import type { TOKENS_TO_STAKE } from 'features/stake/shared/types';

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
  gasCostEth: bigint;
  gasCostWeth: bigint;
  etherBalance: bigint;
  wethBalance: bigint;
  etherLiquidity: bigint;
  shouldValidateEtherBalance: boolean;
  chainId: number;
};

export type L2StakeFormNetworkData = {
  wstethBalance?: bigint;
  etherBalance?: bigint;
  wethBalance?: bigint;
  isWethSupported: boolean;
  isSmartAccount?: boolean;
  stakeableEther?: bigint;
  stakeableWeth?: bigint;
  fastStakeLiquidityEth?: bigint;
  gasCostEth?: bigint;
  gasCostWeth?: bigint;
  gasLimitEth?: bigint;
  gasLimitWeth?: bigint;
  maxAmountEth?: bigint;
  maxAmountWeth?: bigint;
  loading: {
    isWstethBalanceLoading: boolean;
    isSmartAccountLoading: boolean;
    isMaxGasPriceLoading: boolean;
    isEtherBalanceLoading: boolean;
    isWethBalanceLoading: boolean;
    isFastStakeLiquidityLoading: boolean;
    isStakeableEtherLoading: boolean;
    isStakeableWethLoading: boolean;
  };
  revalidate: () => Promise<void>;
};
