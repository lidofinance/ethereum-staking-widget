import { PopoverProps } from '@lidofinance/lido-ui';
export type { Theme } from '@lidofinance/lido-ui';

export type TooltipProps = Omit<
  PopoverProps,
  'anchorRef' | 'title' | 'open' | 'backdrop' | 'children'
> & {
  title: React.ReactNode;
  // element ref must be a callback or object ref (not a legacy string ref)
  children: React.ReactElement & { ref?: React.Ref<HTMLElement> };
};
