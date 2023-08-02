import { PopoverProps } from '@lidofinance/lido-ui';
export type { Theme } from '@lidofinance/lido-ui';

export type TooltipProps = Omit<
  PopoverProps,
  'anchorRef' | 'title' | 'open' | 'backdrop' | 'children'
> & {
  title: React.ReactNode;
  children: React.ReactElement & React.RefAttributes<HTMLElement>;
};
