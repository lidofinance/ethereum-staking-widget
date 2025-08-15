// TODO: path + basePath
export const HOME_PATH = '/';
export const WRAP_PATH = '/wrap';
export const WRAP_UNWRAP_PATH = '/wrap/unwrap';
export const WITHDRAWALS_PATH = '/withdrawals';
export const WITHDRAWALS_REQUEST_PATH = '/withdrawals/request';
export const WITHDRAWALS_CLAIM_PATH = '/withdrawals/claim';
export const REWARDS_PATH = '/rewards';
export const SETTINGS_PATH = '/settings';
export const REFERRAL_PATH = '/referral';

// Earn paths
export const EARN_PATH = '/earn';
export const EARN_VAULT_GGV_SLUG = 'ggv';
export const EARN_VAULT_DVV_SLUG = 'dvv';
export const EARN_VAULT_DEPOSIT_SLUG = 'deposit';
export const EARN_VAULT_WITHDRAW_SLUG = 'withdraw';

export const getPathWithoutFirstSlash = (path: string): string => {
  if (path.length === 0 || path[0] !== '/') return path;

  return path.slice(1, path.length);
};
