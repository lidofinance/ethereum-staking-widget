import { EthDepositTokensMain } from '../../types';

export type ETHDepositFormValues = {
  amount: null | bigint;
  token: EthDepositTokensMain;
  referral: string | null;
};

export type ETHDepositFormValidatedValues = {
  amount: bigint;
  token: EthDepositTokensMain;
  referral: string | null;
};

export type ETHDepositFormValidationContext = {
  isWalletActive: boolean;
  asyncContext: Promise<ETHDepositFormAsyncValidationContext>;
};

export type ETHDepositFormAsyncValidationContext = {
  [key in EthDepositTokensMain]: {
    balance: bigint;
  };
};

export type ETHDepositFormDataContextValue = {
  maxAmount?: bigint;
  isLoading: boolean;
  token: EthDepositTokensMain;
  isDepositLockedForCurrentToken: boolean;
};
