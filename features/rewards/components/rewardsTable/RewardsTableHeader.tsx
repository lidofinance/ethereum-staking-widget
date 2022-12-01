import { Tr, Thead } from '@lidofinance/lido-ui';

import { RewardsTableHeaderCell } from './RewardsTableHeaderCell';
import { RewardsTableHeaderProps } from './types';

export const RewardsTableHeader = (
  props: RewardsTableHeaderProps,
): JSX.Element => {
  const { columns, currency } = props;

  return (
    <Thead sticky>
      <Tr>
        {columns.map(({ field, name }) => {
          return (
            <RewardsTableHeaderCell
              key={String(field)}
              value={name || field}
              field={field}
              currency={currency}
            />
          );
        })}
      </Tr>
    </Thead>
  );
};
