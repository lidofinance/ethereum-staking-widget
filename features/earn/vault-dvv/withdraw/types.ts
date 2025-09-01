export type DVVWithdrawalFormContext = {
  isLoading: boolean;
};

export type DVVWithdrawalFormValues = {
  amount: bigint | null;
};

export type DVVWithdrawalFormAsyncValidationContext = {
  balance: bigint;
  isWithdrawalPaused: boolean;
};

export type DVVWithdrawalFormValidationContext = {
  isWalletActive: boolean;
  asyncContext: Promise<DVVWithdrawalFormAsyncValidationContext>;
};
