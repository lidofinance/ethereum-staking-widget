import type { LIDO_TOKENS } from '@lidofinance/lido-ethereum-sdk/common';

export type GGVDepositTokens =
  | (typeof LIDO_TOKENS)['eth']
  | (typeof LIDO_TOKENS)['steth']
  | (typeof LIDO_TOKENS)['wsteth']
  | 'wETH';

export type GGVDepositFormValues = {
  amount: null | bigint;
  token: GGVDepositTokens;
  referral: string | null;
};

export type GGVDepositFormValidatedValues = {
  amount: bigint;
  token: GGVDepositTokens;
  referral: string | null;
};

export type GGVDepositFormValidationContext = {
  isWalletActive: boolean;
  asyncContext: Promise<GGVDepositFormAsyncValidationContext>;
};

export type GGVDepositFormAsyncValidationContext = {
  [key in GGVDepositTokens]: {
    balance: bigint;
    // null for unlimited deposits
    maxDeposit: bigint | null;
  };
};

export type GGVDepositFormDataContextValue = {
  maxAmount?: bigint;
  isLoading: boolean;
  token: GGVDepositTokens;
};
