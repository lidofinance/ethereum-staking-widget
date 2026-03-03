import { EthDepositTokenSymbolForm } from '../../types';

export type ETHDepositFormValues = {
  amount: null | bigint;
  token: EthDepositTokenSymbolForm;
  referral: string | null;
};

export type ETHDepositFormValidatedValues = {
  amount: bigint;
  token: EthDepositTokenSymbolForm;
  referral: string | null;
};

export type ETHDepositFormValidationContext = {
  isWalletActive: boolean;
  asyncContext: Promise<ETHDepositFormAsyncValidationContext>;
};

export type ETHDepositFormAsyncValidationContext = {
  [key in EthDepositTokenSymbolForm]: {
    balance: bigint;
  };
};

export type ETHDepositFormDataContextValue = {
  maxAmount?: bigint;
  isLoading: boolean;
  token: EthDepositTokenSymbolForm;
  isDepositLockedForCurrentToken: boolean;
};
