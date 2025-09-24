export type STG_WITHDRAW_TOKENS = 'strETH';

export type STGWithdrawFormValues = {
  amount: null | bigint;
  token: STG_WITHDRAW_TOKENS;
};

export type STGWithdrawFormValidatedValues = {
  amount: bigint;
  token: STG_WITHDRAW_TOKENS;
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
  token: STG_WITHDRAW_TOKENS;
};
