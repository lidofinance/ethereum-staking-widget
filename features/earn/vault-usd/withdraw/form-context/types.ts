import { TokenSymbols } from 'consts/tokens';
import type { UsdWithdrawTokenSymbol } from '../../types';

type WITHDRAW_TOKENS = TokenSymbols['earnusd'];

export type UsdVaultWithdrawFormValues = {
  amount: null | bigint;
  token: UsdWithdrawTokenSymbol;
};

export type UsdVaultWithdrawFormValidatedValues = {
  amount: bigint;
  token: UsdWithdrawTokenSymbol;
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
