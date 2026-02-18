import {
  ETH_VAULT_DEPOSIT_TOKENS,
  ETH_VAULT_DEPOSIT_TOKENS_MAIN,
  ETH_VAULT_DEPOSIT_TOKENS_UPGRADABLE,
} from './consts';

export type EthDepositTokens = (typeof ETH_VAULT_DEPOSIT_TOKENS)[number];

export type EthDepositTokensMain =
  (typeof ETH_VAULT_DEPOSIT_TOKENS_MAIN)[number];

export type EthDepositTokensUpgradable =
  (typeof ETH_VAULT_DEPOSIT_TOKENS_UPGRADABLE)[number];
