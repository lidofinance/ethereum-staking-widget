import { TokenSymbols } from 'consts/tokens';

type WITHDRAW_TOKENS = TokenSymbols['earneth'];

export type EthVaultWithdrawFormValues = {
  amount: null | bigint;
};

export type EthVaultWithdrawFormValidatedValues = {
  amount: bigint;
};

export type EthVaultWithdrawFormValidationContext = {
  isWalletActive: boolean;
  asyncContext: Promise<EthVaultWithdrawFormAsyncValidationContext>;
};

export type EthVaultWithdrawFormAsyncValidationContext = {
  [key in WITHDRAW_TOKENS]: {
    balance: bigint;
  };
};

export type EthVaultWithdrawFormDataContextValue = {
  maxAmount?: bigint;
  isLoading: boolean;
};
