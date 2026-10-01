export type L2StakeFormInputType = {
  amount: bigint | null;
  referral: string | null;
};

export type L2StakeFormValidatedInputType = {
  amount: bigint;
  referral: string | null;
};

export type L2StakeFormDataContextValue = Pick<
  L2StakeFormNetworkData,
  'stakeableEther' | 'maxAmount' | 'gasCost' | 'loading'
>;

export type L2StakeFormValidationContext = {
  isWalletActive: boolean;
  isSmartAccount: boolean;
  gasCost: bigint;
  etherBalance: bigint;
  etherLiquidity: bigint;
  shouldValidateEtherBalance: boolean;
  chainId: number;
};

export type L2StakeFormNetworkData = {
  wstethBalance?: bigint;
  etherBalance?: bigint;
  isSmartAccount?: boolean;
  stakeableEther?: bigint;
  fastStakeLiquidityEth?: bigint;
  gasCost?: bigint;
  gasLimit?: bigint;
  maxAmount?: bigint;
  loading: {
    isWstethBalanceLoading: boolean;
    isSmartAccountLoading: boolean;
    isMaxGasPriceLoading: boolean;
    isEtherBalanceLoading: boolean;
    isFastStakeLiquidityLoading: boolean;
    isStakeableEtherLoading: boolean;
  };
  revalidate: () => Promise<void>;
};
