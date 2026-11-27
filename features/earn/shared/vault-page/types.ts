import type { ReactNode } from 'react';

export type { VaultName } from '../vault-chart/consts';
export type { VaultPerformanceMatomo as VaultChartMatomo } from '../vault-chart';

export type VaultApx = {
  value?: number | null;
  // e.g. 'APY* (14d avg.)'
  label?: string;
  hint?: ReactNode;
  updateTooltipText?: ReactNode;
  isStale?: boolean;
  isLoading?: boolean;
};

export type VaultTvl = {
  value?: number | null;
  isLoading?: boolean;
};

export const DEFAULT_APX_LABEL = 'APY* (14d avg.)';
