import { UsdDepositTokenSymbol } from '../../types';

export type USDDepositFormValues = {
  amount: null | bigint;
  token: UsdDepositTokenSymbol;
  referral: string | null;
};

export type USDDepositFormValidatedValues = {
  amount: bigint;
  token: UsdDepositTokenSymbol;
  referral: string | null;
};

export type USDDepositFormValidationContext = {
  isWalletActive: boolean;
  asyncContext: Promise<USDDepositFormAsyncValidationContext>;
};

export type USDDepositFormAsyncValidationContext = {
  [key in UsdDepositTokenSymbol]: {
    balance: bigint;
  };
};

export type USDDepositFormDataContextValue = {
  maxAmount?: bigint;
  isLoading: boolean;
  token: UsdDepositTokenSymbol;
  isDepositLockedForCurrentToken: boolean;
};
