import type { Event } from 'features/rewards/types';
import { ComponentProps } from 'react';
import { type CurrencyType } from 'features/rewards/constants';
import { type Td } from '@lidofinance/lido-ui';

export type RewardsTableConfig = {
  columnsOrder: Column<Event>[];
  page: number;
  take: number;
  columnsConfig?: ColumnConfig<keyof Event>;
};

type Column<T> = {
  field: keyof T;
  name?: string;
};

type RewardsColumnsConfig = {
  ['data-mobile']?: boolean;
  ['data-mobile-align']?: 'left' | 'right';
} & ComponentProps<typeof Td>;

type ColumnConfig<T extends symbol | string | number> =
  | Partial<Record<T, RewardsColumnsConfig>>
  | undefined;

export interface RewardsTableProps {
  data: Event[];
  currency: CurrencyType;
  totalItems: number | undefined;
  page: number;
  setPage: (page: number) => void;
  pending: boolean;
}

export interface RewardsTableHeaderProps {
  columns: Column<Event>[];
  config?: ColumnConfig<keyof Event>;
  currency: CurrencyType;
}

export interface RewardsTableRowProps {
  columns: Column<Event>[];
  data: Event;
  config: ColumnConfig<keyof Event>;
  currency: CurrencyType;
}

export interface RewardsTableCellProps {
  value: Event[keyof Event];
  column: Column<Event>;
  cellConfig?: RewardsColumnsConfig;
  data: Event;
  currency: CurrencyType;
}

export interface RewardsTableHeaderCellProps {
  value: string;
  field: keyof Event;
  currency: CurrencyType;
  cellConfig?: RewardsColumnsConfig;
}
