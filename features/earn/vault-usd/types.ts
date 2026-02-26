import {
  USD_VAULT_DEPOSIT_TOKEN_SYMBOLS,
  USD_VAULT_DEPOSIT_TOKENS,
} from './consts';

export type UsdDepositToken = (typeof USD_VAULT_DEPOSIT_TOKENS)[number];

export type UsdDepositTokenSymbol =
  (typeof USD_VAULT_DEPOSIT_TOKEN_SYMBOLS)[UsdDepositToken];
