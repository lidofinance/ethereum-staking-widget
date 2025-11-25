import { LineData } from '@lidofinance/lido-ui';

export type LineDataWithAllocation = LineData & { allocation: number };
export type AllocationItem = {
  allocation: number;
  apy: number;
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
    allocations: AllocationItem[];
    totalTvlUSD: number;
    totalTvlETH: bigint;
  };
  isLoading: boolean;
  apy?: number | null;
  footer?: string;
};
