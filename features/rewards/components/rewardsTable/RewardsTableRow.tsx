import { Tr } from '@lidofinance/lido-ui';
import { FC } from 'react';

import { RewardsTableCell } from './RewardsTableCell';
import { RewardsTableRowProps } from './types';

export const RewardsTableRow: FC<RewardsTableRowProps> = (
  props,
): JSX.Element => {
  const { columns, data, config, ...rest } = props;

  return (
    <Tr>
      {columns.map((column) => (
        <RewardsTableCell
          key={String(column.field)}
          column={column}
          value={data[column.field]}
          cellConfig={config?.[column.field]}
          data={data}
          {...rest}
        />
      ))}
    </Tr>
  );
};
