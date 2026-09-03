export const COLLECTOR_CONFIG = {
  baseAssetFallback: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  oracleUpdateInterval: 86400n,
  redeemHandlingInterval: 3600n,
} as const;

export const MELLOW_VAULTS_QUERY_SCOPE = 'mellow-meta-vault';

export const WITHDRAWAL_WAITING_TIME_TOOLTIP =
  'Withdrawals are instant when the buffer has enough liquidity to cover your request. Larger requests go to the withdrawal queue, usually settled within 72 hours but occasionally longer depending on size.';

export const ACTIVE_FEES_TOOLTIP =
  "Displays the vault's current fees. Fees are flexible and may change to reflect market conditions. The AUM fee (a percentage of total holdings) cannot exceed 0.5%, and the performance fee (a percentage of yield earned) cannot exceed 20%.";
