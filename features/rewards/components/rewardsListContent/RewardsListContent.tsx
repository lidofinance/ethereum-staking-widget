import { FC } from 'react';
import { Loader, Divider } from '@lidofinance/lido-ui';
import { useRewardsHistory } from 'features/rewards/hooks';
import { ErrorBlockNoSteth } from 'features/rewards/components/errorBlocks/ErrorBlockNoSteth';

import { RewardsListsEmpty } from './RewardsListsEmpty';
import { RewardsListErrorMessage } from './RewardsListErrorMessage';
import { LoaderWrapper, TableWrapperStyle } from './RewardsListContentStyles';
import { RewardsTable } from 'features/rewards/components/rewardsTable';

export const RewardsListContent: FC = () => {
  const {
    error,
    initialLoading,
    data,
    currencyObject,
    page,
    setPage,
    isLagging,
  } = useRewardsHistory();

  if (!data && !initialLoading && !error) return <RewardsListsEmpty />;
  // showing loading when canceling requests and empty response
  if ((!data && !error) || (initialLoading && !data?.events.length)) {
    return (
      <>
        <Divider indents="lg" />
        <LoaderWrapper>
          <Loader />
        </LoaderWrapper>
      </>
    );
  }
  if (error) return <RewardsListErrorMessage error={error} />;
  if (data && !data.events.length) return <ErrorBlockNoSteth />;

  return (
    <TableWrapperStyle>
      {data?.events.length && !error && (
        <RewardsTable
          data={data.events}
          currency={currencyObject}
          totalItems={data.totalItems}
          page={page}
          setPage={setPage}
          pending={isLagging}
        />
      )}
    </TableWrapperStyle>
  );
};
