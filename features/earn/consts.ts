export const EARN_VAULT_DEPOSIT_SLUG = 'deposit';
export const EARN_VAULT_WITHDRAW_SLUG = 'withdraw';

export const EARN_VAULT_GGV_SLUG = 'ggv';
export const EARN_VAULT_DVV_SLUG = 'dvv';
export const EARN_VAULT_STG_SLUG = 'stg';

export const EARN_VAULTS = [
  EARN_VAULT_GGV_SLUG,
  EARN_VAULT_DVV_SLUG,
  EARN_VAULT_STG_SLUG,
] as const;

export type EarnVaultKey = (typeof EARN_VAULTS)[number];
