import type { ReactNode } from 'react';

import type { LineDataWithAllocation } from 'features/earn/shared/vault-allocation';

export type { LineDataWithAllocation };

export type AllocationSubItem = {
  id: string;
  label: string;
  info?: ReactNode;
  chain: string;
  allocation: number;
  tvlUSD: number;
  tvlETH?: bigint;
  icon?: React.FunctionComponent;
};

export type AllocationGroup = {
  name: string;
  info?: ReactNode;
  allocation: number;
  tvlUSD: number;
  items: AllocationSubItem[];
};

export type FlatAllocationItem = {
  name: string;
  info?: ReactNode;
  allocation: number;
  tvlUSD: number;
};

export type AllocationTableData = {
  lastUpdated: number;
  chartData: LineDataWithAllocation[];
  groups: AllocationGroup[];
  flatItems?: FlatAllocationItem[];
  totalTvlUsd?: number;
  totalTvlWei?: bigint;
};

export type VaultAllocationProps = {
  vaultName: 'ethVault' | 'usdVault';
  apy?: number;
  footer?: string;
};
