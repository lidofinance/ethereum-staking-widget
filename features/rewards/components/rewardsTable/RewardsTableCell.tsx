import { FC } from 'react';

import {
  DateCell,
  TypeCell,
  ChangeCell,
  CurrencyChangeCell,
  AprCell,
  BalanceCell,
  DefaultCell,
} from './RewardsTableCells';
import { RewardsTableCellProps } from './types';

const getComponent = (type?: string): React.FC<RewardsTableCellProps> => {
  switch (type) {
    case 'blockTime':
      return DateCell;
    case 'type':
      return TypeCell;
    case 'change':
      return ChangeCell;
    case 'currencyChange':
      return CurrencyChangeCell;
    case 'apr':
      return AprCell;
    case 'balance':
      return BalanceCell;
    default:
      return DefaultCell;
  }
};

export const RewardsTableCell: FC<RewardsTableCellProps> = (
  props,
): JSX.Element => {
  const Component = getComponent(props.column.field);

  return <Component {...props} />;
};
