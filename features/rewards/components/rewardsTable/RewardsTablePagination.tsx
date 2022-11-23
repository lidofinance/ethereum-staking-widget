import { FC } from 'react';
import { Pagination, PaginationProps } from '@lidofinance/lido-ui';

import { RewardsTablePaginationWrapperStyle } from './RewardsTableStyles';

export const RewardsTablePagination: FC<PaginationProps> = (props) => {
  return (
    <RewardsTablePaginationWrapperStyle>
      <Pagination {...props} />
    </RewardsTablePaginationWrapperStyle>
  );
};
