import type { ReactNode } from 'react';

export type StrategyInfoRow = {
  label: string;
  value: ReactNode;
  info?: ReactNode;
};

export type StrategyInfoLink = {
  label: string;
  href: string;
};
