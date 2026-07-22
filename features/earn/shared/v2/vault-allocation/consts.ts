export const METAVAULT_CHART_ORIGIN = 'https://api.mellow.finance';

export const MIN_ALLOCATION_DISPLAY_PERCENT = 0.1;

export const AVAILABLE_TIP =
  'The amount of tokens available for withdrawals, pending allocation to new strategies, and reserved for liquidity needs';
export const OTHER_TIP =
  'The amount of a newly allocated position. Detailed data will be provided soon';
export const PENDING_TIP =
  'The amount of tokens in the process of being deposited to the vault';

export const BASE_ALLOCATION_LABEL_ALLOWLIST = [
  'aave',
  'aura',
  'earnusd',
  'earnusdc',
  'earnusde',
  'eth',
  'ethena',
  'gho',
  'levered',
  'lido',
  'main',
  'mantle',
  'maple',
  'metamorpho',
  'morpho',
  'plasma',
  'pt',
  'pt_srusde',
  'pyusd',
  'reusd',
  'rseth',
  'sentora',
  'spark',
  'sparklend',
  'strategy',
  'susde',
  'syrup',
  'syrupusdt',
  'twyne',
  'usd',
  'usdc',
  'usde',
  'usdt',
  'usdt0',
  'weth',
  'wsteth',
  'ggv',
  'boring',
  'queue',
  'boringqueue',
  'susde',
  'withdrawal',
  'requests',
] as const;

export const getAllocationLabelAllowlist = (
  configuredWords: readonly string[],
): string[] => [
  ...new Set([...BASE_ALLOCATION_LABEL_ALLOWLIST, ...configuredWords]),
];

type SubvaultWithTip = 'earnusdc' | 'ggv' | 'streth';
const USDC_VAULT_TIP =
  'A strategy designed to amplify USD yield by combining low-risk and highly liquid stablecoin strategies with carefully selected DeFi strategies.';
const GGV_VAULT_TIP =
  'A legacy vault in its final stage, existing positions are being safely migrated to EarnETH.';
const STRATEGY_VAULT_TIP =
  'A professionally curated strategy by Mellow, built around battle-tested DeFi protocols designed to perform steadily across all market conditions.';

export const SUBVAULTS_TIP_BY_ID: {
  [key in SubvaultWithTip]: string;
} = {
  earnusdc: USDC_VAULT_TIP,
  ggv: GGV_VAULT_TIP,
  streth: STRATEGY_VAULT_TIP,
};
