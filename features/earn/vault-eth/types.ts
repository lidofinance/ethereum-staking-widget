import {
  ETH_VAULT_DEPOSIT_TOKENS,
  ETH_VAULT_DEPOSIT_TOKENS_FORM,
  ETH_VAULT_DEPOSIT_TOKENS_UPGRADABLE,
  ETH_VAULT_DEPOSIT_TOKEN_SYMBOLS_FORM,
} from './consts';

export type EthDepositToken = (typeof ETH_VAULT_DEPOSIT_TOKENS)[number];

export type EthDepositTokenForm =
  (typeof ETH_VAULT_DEPOSIT_TOKENS_FORM)[number];

export type EthDepositTokenUpgradable =
  (typeof ETH_VAULT_DEPOSIT_TOKENS_UPGRADABLE)[number];

export type EthDepositTokenSymbolForm =
  (typeof ETH_VAULT_DEPOSIT_TOKEN_SYMBOLS_FORM)[EthDepositTokenForm];
