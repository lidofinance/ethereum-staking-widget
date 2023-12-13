import { useBreakpoint, IdenticonBadgeProps } from '@lidofinance/lido-ui';
import { AddressBadgeStyle } from './styles';
import { Component } from 'types';

export type AddressBadgeComponent = Component<
  'div',
  Omit<IdenticonBadgeProps, 'address' | 'as'> & { address?: string | null }
>;

export const AddressBadge: AddressBadgeComponent = (props) => {
  const { address, ...rest } = props;
  const isMobile = useBreakpoint('sm');

  return (
    <AddressBadgeStyle
      symbols={isMobile ? 3 : 6}
      address={address ?? ''}
      {...rest}
    />
  );
};
