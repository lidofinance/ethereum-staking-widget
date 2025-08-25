import type { LIDO_TOKENS } from '@lidofinance/lido-ethereum-sdk/common';

export type GGV_DEPOSIT_TOKENS =
  | (typeof LIDO_TOKENS)['eth']
  | (typeof LIDO_TOKENS)['steth']
  | (typeof LIDO_TOKENS)['wsteth']
  | 'wETH';

export type GGVDepositFormValues = {
  amount: null | bigint;
  token: GGV_DEPOSIT_TOKENS;
};

export type GGVDepositFormValidatedValues = {
  amount: bigint;
  token: GGV_DEPOSIT_TOKENS;
};

export type GGVDepositFormValidationContext = {
  isWalletActive: boolean;
  asyncContext: Promise<GGVDepositFormAsyncValidationContext>;
};

export type GGVDepositFormAsyncValidationContext = {
  [key in GGV_DEPOSIT_TOKENS]: {
    balance: bigint;
    // null for unlimited deposits
    maxDeposit: bigint | null;
  };
};

export type GGVDepositFormDataContextValue = {
  maxAmount?: bigint;
  isLoading: boolean;
  token: GGV_DEPOSIT_TOKENS;
};
