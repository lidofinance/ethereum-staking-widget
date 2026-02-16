import { USD_VAULT_DEPOSABLE_TOKENS } from '../../consts';

export type USD_DEPOSIT_TOKENS = (typeof USD_VAULT_DEPOSABLE_TOKENS)[number];

export type USDDepositFormValues = {
  amount: null | bigint;
  token: USD_DEPOSIT_TOKENS;
  referral: string | null;
};

export type USDDepositFormValidatedValues = {
  amount: bigint;
  token: USD_DEPOSIT_TOKENS;
  referral: string | null;
};

export type USDDepositFormValidationContext = {
  isWalletActive: boolean;
  asyncContext: Promise<USDDepositFormAsyncValidationContext>;
};

export type USDDepositFormAsyncValidationContext = {
  [key in USD_DEPOSIT_TOKENS]: {
    balance: bigint;
  };
};

export type USDDepositFormDataContextValue = {
  maxAmount?: bigint;
  isLoading: boolean;
  token: USD_DEPOSIT_TOKENS;
  isDepositLockedForCurrentToken: boolean;
};
