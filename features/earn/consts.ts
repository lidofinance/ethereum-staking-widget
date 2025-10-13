import { EARN_PATH } from 'consts/urls';

export const EARN_VAULT_DEPOSIT_SLUG = 'deposit';
export const EARN_VAULT_WITHDRAW_SLUG = 'withdraw';

export const EARN_VAULT_GGV_SLUG = 'ggv';
export const EARN_VAULT_DVV_SLUG = 'dvv';
export const EARN_VAULT_STG_SLUG = 'strategy-dont-enable';

export const EARN_VAULTS = [
  EARN_VAULT_GGV_SLUG,
  EARN_VAULT_DVV_SLUG,
  EARN_VAULT_STG_SLUG,
] as const;

export const GGV_DEPOSIT_PATH = `${EARN_PATH}/${EARN_VAULT_GGV_SLUG}/${EARN_VAULT_DEPOSIT_SLUG}`;
export const GGV_WITHDRAW_PATH = `${EARN_PATH}/${EARN_VAULT_GGV_SLUG}/${EARN_VAULT_WITHDRAW_SLUG}`;

export const DVV_DEPOSIT_PATH = `${EARN_PATH}/${EARN_VAULT_DVV_SLUG}/${EARN_VAULT_DEPOSIT_SLUG}`;
export const DVV_WITHDRAW_PATH = `${EARN_PATH}/${EARN_VAULT_DVV_SLUG}/${EARN_VAULT_WITHDRAW_SLUG}`;

export const STG_DEPOSIT_PATH = `${EARN_PATH}/${EARN_VAULT_STG_SLUG}/${EARN_VAULT_DEPOSIT_SLUG}`;
export const STG_WITHDRAW_PATH = `${EARN_PATH}/${EARN_VAULT_STG_SLUG}/${EARN_VAULT_WITHDRAW_SLUG}`;

export type EarnVaultKey = (typeof EARN_VAULTS)[number];
