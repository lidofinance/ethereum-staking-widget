import type {
  EARN_VAULT_DEPOSIT_SLUG,
  EARN_VAULT_WITHDRAW_SLUG,
} from '../../../consts';

export type VaultAction =
  typeof EARN_VAULT_DEPOSIT_SLUG | typeof EARN_VAULT_WITHDRAW_SLUG;

export type VaultPositionSummary = {
  // amount in the base token, e.g. ETH
  amount?: bigint;
  symbol: string;
  sharesAmount?: bigint;
  sharesSymbol: string;
  usdAmount?: number;
  isLoading?: boolean;
};
