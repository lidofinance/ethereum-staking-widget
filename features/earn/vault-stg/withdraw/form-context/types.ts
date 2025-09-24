export type STG_WITHDRAW_TOKENS = 'strETH';

export type STGWithdrawFormValues = {
  amount: null | bigint;
};

export type STGWithdrawFormValidatedValues = {
  amount: bigint;
};

export type STGWithdrawFormValidationContext = {
  isWalletActive: boolean;
  asyncContext: Promise<STGWithdrawFormAsyncValidationContext>;
};

export type STGWithdrawFormAsyncValidationContext = {
  [key in STG_WITHDRAW_TOKENS]: {
    balance: bigint;
  };
};

export type STGWithdrawFormDataContextValue = {
  maxAmount?: bigint;
  isLoading: boolean;
};
