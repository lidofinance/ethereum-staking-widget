import type { LIDO_TOKENS } from '@lidofinance/lido-ethereum-sdk/common';

export type STG_DEPOSIT_TOKENS =
  | (typeof LIDO_TOKENS)['eth']
  | (typeof LIDO_TOKENS)['wsteth']
  | 'wETH';

export type STGDepositFormValues = {
  amount: null | bigint;
  token: STG_DEPOSIT_TOKENS;
};

export type STGDepositFormValidatedValues = {
  amount: bigint;
  token: STG_DEPOSIT_TOKENS;
};

export type STGDepositFormValidationContext = {
  isWalletActive: boolean;
  asyncContext: Promise<STGDepositFormAsyncValidationContext>;
};

export type STGDepositFormAsyncValidationContext = {
  [key in STG_DEPOSIT_TOKENS]: {
    balance: bigint;
  };
};

export type STGDepositFormDataContextValue = {
  maxAmount?: bigint;
  isLoading: boolean;
  token: STG_DEPOSIT_TOKENS;
  isDepositLockedForCurrentToken: boolean;
};
