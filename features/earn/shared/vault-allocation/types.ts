import { LineData } from '@lidofinance/lido-ui';

export type LineDataWithAllocation = LineData & { allocation: number };
export type AllocationItem = {
  allocation: number;
  chain: string;
  protocol: string;
  tvlETH: bigint;
  tvlUSD: number;
  icon?: React.FunctionComponent;
};

export type VaultAllocationProps = {
  data?: {
    lastUpdated: number;
    chartData: LineDataWithAllocation[];
    positions: AllocationItem[];
    totalTvlUsd?: number;
    totalTvlWei?: bigint;
  };
  isLoading: boolean;
  apy?: number;
  footer?: string;
};
