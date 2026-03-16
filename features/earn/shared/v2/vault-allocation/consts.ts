import { FC } from 'react';
import { SparkIcon, AaveV3Icon, FluidIcon } from 'assets/earn';

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
};

export const ALLOCATION_PENDING_ID = 'pending-deposits';

// Assets which are not allocated yet
export const ALLOCATION_TOKEN_IDS_AVAILABLE = ['eth', 'weth', 'wsteth'];
