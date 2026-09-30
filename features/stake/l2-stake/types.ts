export type L2StakeFormInputType = {
  amount: bigint | null;
  referral: string | null;
};

export type L2StakeFormValidatedInputType = {
  amount: bigint;
  referral: string | null;
};

export type L2StakeFormDataContextValue = {
  stakeableEther: bigint | undefined;
};
