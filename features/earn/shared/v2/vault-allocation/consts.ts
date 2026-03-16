import { FC } from 'react';
import {
  SparkIcon,
  AaveV3Icon,
  FluidIcon,
  UsdcIcon,
  SusdeIcon,
  UsdtIcon,
  MapleIcon,
  MorphoIcon,
} from 'assets/earn';

export const METAVAULT_CHART_ORIGIN = 'https://api.mellow.finance';

export type AllocationProtocolId =
  (typeof ALLOCATION_PROTOCOL_IDS_KNOWN)[number];

export const ALLOCATION_PROTOCOL_IDS_KNOWN = [
  'aave-wsteth-weth',
  'aave-wsteth-usd',
  'aave-rseth-weth',
  'aave-ethena',
  'spark-wsteth-weth',
  'fluid-resolv-usdt',
  'aave-plasma-syrup-usdt-usdt0',
  'usdc',
  'usdt',
  'susde',
  'ethereum-spark-usdc',
  'ethereum-maple-syrupusdc',
  'ethereum-metamorpho-senpyusdmain',
] as const;

export const ALLOCATION_ICONS_BY_ID: {
  [key in AllocationProtocolId]: FC;
} = {
  'aave-wsteth-weth': AaveV3Icon,
  'aave-wsteth-usd': AaveV3Icon,
  'aave-rseth-weth': AaveV3Icon,
  'aave-ethena': AaveV3Icon,
  'spark-wsteth-weth': SparkIcon,
  'fluid-resolv-usdt': FluidIcon,
  'aave-plasma-syrup-usdt-usdt0': AaveV3Icon,
  usdc: UsdcIcon,
  usdt: UsdtIcon,
  susde: SusdeIcon,
  'ethereum-spark-usdc': SparkIcon,
  'ethereum-maple-syrupusdc': MapleIcon,
  'ethereum-metamorpho-senpyusdmain': MorphoIcon,
};

export const ALLOCATION_PENDING_ID = 'pending-deposits';

// Assets which are not allocated yet
export const ALLOCATION_TOKEN_IDS_AVAILABLE = ['eth', 'weth', 'wsteth'];

export const AVAILABLE_TIP =
  'The amount of tokens available for withdrawals, pending allocation to new strategies, and reserved for liquidity needs';
export const OTHER_TIP =
  'The amount of a newly allocated position. Detailed data will be provided soon';
export const PENDING_TIP =
  'The amount of tokens in the process of being deposited to the vault';

const SUBVAULTS_WITH_TIP = ['earnusdc', 'ggv', 'streth'];
const USDC_VAULT_TIP =
  'A strategy designed to amplify USD yield by combining low-risk and highly liquid stablecoin strategies with carefully selected DeFi strategies.';
const GAS_VAULT_TIP = 'GGV';
const STRATEGY_VAULT_TIP = 'Strategy';

export const SUBVAULTS_TIP_BY_ID: {
  [key in (typeof SUBVAULTS_WITH_TIP)[number]]: string;
} = {
  earnusdc: USDC_VAULT_TIP,
  ggv: GAS_VAULT_TIP,
  streth: STRATEGY_VAULT_TIP,
};
