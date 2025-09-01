import type { LIDO_TOKENS } from '@lidofinance/lido-ethereum-sdk/common';

export type DVV_DEPOSIT_TOKENS = (typeof LIDO_TOKENS)['eth'] | 'wETH';

export type DVVDepositFormValues = {
  amount: bigint | null;
  token: DVV_DEPOSIT_TOKENS;
};

export type DVVDepositFormValidatedValues = {
  amount: bigint;
  token: DVV_DEPOSIT_TOKENS;
};

export type DVVDepositFormValidationContext = {
  isWalletActive: boolean;
  asyncContext: Promise<DVVDepositFormAsyncValidationContext>;
};

export type DVVDepositFormAsyncValidationContext = {
  [key in DVV_DEPOSIT_TOKENS]: {
    balance: bigint;
    // null for unlimited deposits
    maxDeposit: bigint | null;
  };
};

export type DVVDepositLimitReason =
  | 'non-whitelisted'
  | 'deposit-paused'
  | 'deposit-limit-reached';

export type DVVDepositFormContext = {
  maxAmount?: bigint;
  token: DVV_DEPOSIT_TOKENS;
  isLoading: boolean;
};
