import { PopoverProps } from '@lidofinance/popover';
export type { Theme } from '@lidofinance/theme';

export type TooltipProps = Omit<
  PopoverProps,
  'anchorRef' | 'title' | 'open' | 'backdrop' | 'children'
> & {
  title: React.ReactNode;
  children: React.ReactElement & React.RefAttributes<HTMLElement>;
};
