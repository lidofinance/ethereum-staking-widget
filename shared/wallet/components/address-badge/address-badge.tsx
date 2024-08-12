import { useBreakpoint, IdenticonBadgeProps } from '@lidofinance/lido-ui';
import { Component } from 'types';
import { AddressBadgeStyle } from './styles';

export type AddressBadgeComponent = Component<
  'div',
  Omit<IdenticonBadgeProps, 'address' | 'as'> & { address?: string | null } & {
    symbolsMobile?: number;
    symbolsDesktop?: number;
  }
>;

export const AddressBadge: AddressBadgeComponent = (props) => {
  const { address, symbolsMobile = 3, symbolsDesktop = 6, ...rest } = props;
  const isMobile = useBreakpoint('md');

  return (
    <AddressBadgeStyle
      symbols={isMobile ? symbolsMobile : symbolsDesktop}
      address={address ?? ''}
      {...rest}
    />
  );
};
