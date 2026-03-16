import type { LIDO_TOKENS } from '@lidofinance/lido-ethereum-sdk/common';

export type STGDepositTokens =
  | (typeof LIDO_TOKENS)['eth']
  | (typeof LIDO_TOKENS)['wsteth']
  | 'wETH';

export type STGDepositFormValues = {
  amount: null | bigint;
  token: STGDepositTokens;
  referral: string | null;
};

export type STGDepositFormValidatedValues = {
  amount: bigint;
  token: STGDepositTokens;
  referral: string | null;
};

export type STGDepositFormValidationContext = {
  isWalletActive: boolean;
  asyncContext: Promise<STGDepositFormAsyncValidationContext>;
};

export type STGDepositFormAsyncValidationContext = {
  [key in STGDepositTokens]: {
    balance: bigint;
  };
};

export type STGDepositFormDataContextValue = {
  maxAmount?: bigint;
  isLoading: boolean;
  token: STGDepositTokens;
  isDepositLockedForCurrentToken: boolean;
};
