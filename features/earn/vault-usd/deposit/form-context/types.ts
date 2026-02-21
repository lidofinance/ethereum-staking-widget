import { UsdDepositTokens } from '../../types';

export type USDDepositFormValues = {
  amount: null | bigint;
  token: UsdDepositTokens;
  referral: string | null;
};

export type USDDepositFormValidatedValues = {
  amount: bigint;
  token: UsdDepositTokens;
  referral: string | null;
};

export type USDDepositFormValidationContext = {
  isWalletActive: boolean;
  asyncContext: Promise<USDDepositFormAsyncValidationContext>;
};

export type USDDepositFormAsyncValidationContext = {
  [key in UsdDepositTokens]: {
    balance: bigint;
  };
};

export type USDDepositFormDataContextValue = {
  maxAmount?: bigint;
  isLoading: boolean;
  token: UsdDepositTokens;
  isDepositLockedForCurrentToken: boolean;
};
