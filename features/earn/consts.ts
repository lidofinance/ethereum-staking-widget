import { EARN_PATH } from 'consts/urls';
import type { ManifestConfigEarnVault } from 'config/external-config';
import type { EnsureSameType } from 'types';

export const EARN_VAULT_DEPOSIT_SLUG = 'deposit';
export const EARN_VAULT_WITHDRAW_SLUG = 'withdraw';

export const EARN_VAULT_GGV_SLUG = 'ggv';
export const EARN_VAULT_DVV_SLUG = 'dvv';
export const EARN_VAULT_STG_SLUG = 'strategy';
export const EARN_VAULT_ETH_SLUG = 'eth';
export const EARN_VAULT_USD_SLUG = 'usd';

export const EARN_VAULTS = [
  EARN_VAULT_GGV_SLUG,
  EARN_VAULT_DVV_SLUG,
  EARN_VAULT_STG_SLUG,
  EARN_VAULT_ETH_SLUG,
  EARN_VAULT_USD_SLUG,
] as const;

export const EARN_VAULTS_V1_DESIGN = [
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

export const ETH_DEPOSIT_PATH = `${EARN_PATH}/${EARN_VAULT_ETH_SLUG}/${EARN_VAULT_DEPOSIT_SLUG}`;
export const ETH_WITHDRAW_PATH = `${EARN_PATH}/${EARN_VAULT_ETH_SLUG}/${EARN_VAULT_WITHDRAW_SLUG}`;

export const USD_DEPOSIT_PATH = `${EARN_PATH}/${EARN_VAULT_USD_SLUG}/${EARN_VAULT_DEPOSIT_SLUG}`;
export const USD_WITHDRAW_PATH = `${EARN_PATH}/${EARN_VAULT_USD_SLUG}/${EARN_VAULT_WITHDRAW_SLUG}`;

// Asserts equality to IPFS.json
export type EarnVaultKey = EnsureSameType<
  (typeof EARN_VAULTS)[number],
  ManifestConfigEarnVault
>;

export type EarnVaultV1DesignKey = (typeof EARN_VAULTS_V1_DESIGN)[number];
