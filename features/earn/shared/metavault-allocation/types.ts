import type { ReactNode } from 'react';

// One segment of the stacked bar and one legend item.
export type AllocationChartItem = {
  name: string;
  color: string;
  allocation: number;
  isSummary?: boolean;
};

// A subvault holds only real protocol positions; Available / Pending / Others
// are summed into FlatAllocationItem summary rows at the metavault level.
export type AllocationSubItem = {
  id: string;
  label: string;
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
  isSummary?: boolean;
  info?: ReactNode;
  chain?: string;
  icon?: React.FunctionComponent;
  allocation: number;
  tvlUSD: number;
};

export type AllocationTableData = {
  lastUpdated: number;
  chartData: AllocationChartItem[];
  groups: AllocationGroup[];
  flatItems?: FlatAllocationItem[];
  totalTvlUsd?: number;
  totalTvlWei?: bigint;
};

export type MetavaultAllocationProps = {
  vaultName: 'ethVault' | 'usdVault';
  // DOM id for in-page anchors
  id?: string;
  // Text of the tooltip next to the update date
  updatedTooltip?: ReactNode;
};
