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

export type L2StakeFormNetworkData = {
  wstethBalance?: bigint;
  etherBalance?: bigint;
  isSmartAccount?: boolean;
  stakeableEther?: bigint;
  gasCost?: bigint;
  gasLimit?: bigint;
  maxAmount?: bigint;
  loading: {
    isWstethBalanceLoading: boolean;
    isSmartAccountLoading: boolean;
    isMaxGasPriceLoading: boolean;
    isEtherBalanceLoading: boolean;
    isStakeableEtherLoading: boolean;
  };
  revalidate: () => Promise<void>;
};
