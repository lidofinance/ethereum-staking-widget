import { TokenSymbols } from 'consts/tokens';

type WITHDRAW_TOKENS = TokenSymbols['earnusd'];

export type UsdVaultWithdrawFormValues = {
  amount: null | bigint;
};

export type UsdVaultWithdrawFormValidatedValues = {
  amount: bigint;
};

export type UsdVaultWithdrawFormValidationContext = {
  isWalletActive: boolean;
  asyncContext: Promise<UsdVaultWithdrawFormAsyncValidationContext>;
};

export type UsdVaultWithdrawFormAsyncValidationContext = {
  [key in WITHDRAW_TOKENS]: {
    balance: bigint;
  };
};

export type UsdVaultWithdrawFormDataContextValue = {
  maxAmount?: bigint;
  isLoading: boolean;
};
