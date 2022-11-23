import { FC } from 'react';
import { Loader, Divider } from '@lidofinance/lido-ui';
import { useRewardsHistory } from 'features/rewards/hooks';
import { extractErrorMessage } from 'utils';
import { NoStEthError } from 'features/rewards/components/Errors';

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

  const errorMessage = extractErrorMessage(error);

  if (!data && !initialLoading && !error) return <RewardsListsEmpty />;
  if ((!data && !error) || initialLoading) {
    return (
      <>
        <Divider indents="lg" />
        <LoaderWrapper>
          <Loader />
        </LoaderWrapper>
      </>
    );
  }
  if (error) return <RewardsListErrorMessage errorMessage={errorMessage} />;
  if (data && !data.events.length) return <NoStEthError />;

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
