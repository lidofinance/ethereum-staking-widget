import { FC } from 'react';
import { Tbody } from '@lidofinance/lido-ui';

import { RewardsTableHeader } from './RewardsTableHeader';
import { RewardsTableRow } from './RewardsTableRow';
import { RewardsTablePagination } from './RewardsTablePagination';
import { RewardsTableLoader } from './RewardsTableLoader';
import { REWARDS_TABLE_CONFIG } from './contsnats';
import {
  RewardsTableStyle,
  RewardsTableWrapperStyle,
} from './RewardsTableStyles';
import { RewardsTableProps } from './types';

export const RewardsTable: FC<RewardsTableProps> = (props) => {
  const { data, currency, totalItems, page, setPage, pending } = props;
  const pageCount = Math.ceil((totalItems ?? 0) / REWARDS_TABLE_CONFIG.take);

  return (
    <>
      <RewardsTableWrapperStyle>
        {pending && <RewardsTableLoader />}
        <RewardsTableStyle>
          <RewardsTableHeader
            columns={REWARDS_TABLE_CONFIG.columnsOrder}
            config={REWARDS_TABLE_CONFIG.columnsConfig}
            currency={currency}
          />
          <Tbody>
            {data?.map((data, index) => (
              <RewardsTableRow
                key={index}
                columns={REWARDS_TABLE_CONFIG.columnsOrder}
                data={data}
                config={REWARDS_TABLE_CONFIG.columnsConfig}
                currency={currency}
              />
            ))}
          </Tbody>
        </RewardsTableStyle>
      </RewardsTableWrapperStyle>
      <RewardsTablePagination
        pagesCount={pageCount}
        onItemClick={(currentPage: number) => setPage(currentPage - 1)}
        activePage={page + 1}
        siblingCount={0}
        data-testid="pagination"
      />
    </>
  );
};
