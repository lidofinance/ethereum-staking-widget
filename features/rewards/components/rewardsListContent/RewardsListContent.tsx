import { FC } from 'react';
import { Loader, Divider } from '@lidofinance/lido-ui';
import { useSDK, useTokenBalance } from '@lido-sdk/react';
import { TOKENS, getTokenAddress } from '@lido-sdk/constants';
import { Zero } from '@ethersproject/constants';

import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { useRewardsHistory } from 'features/rewards/hooks';
import { ErrorBlockNoSteth } from 'features/rewards/components/errorBlocks/ErrorBlockNoSteth';
import { RewardsTable } from 'features/rewards/components/rewardsTable';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

import { RewardsListsEmpty } from './RewardsListsEmpty';
import { RewardsListErrorMessage } from './RewardsListErrorMessage';
import { RewardsListsUnsupportedChain } from './RewardsListsUnsupportedChain';
import {
  LoaderWrapper,
  TableWrapperStyle,
  ErrorWrapper,
} from './RewardsListContentStyles';

export const RewardsListContent: FC = () => {
  const { isWalletConnected, isSupportedChain } = useDappStatus();
  const {
    address,
    error,
    initialLoading,
    data,
    currencyObject,
    page,
    setPage,
    isLagging,
  } = useRewardsHistory();
  // temporarily until we switched to a new SDK
  const { chainId } = useSDK();
  const { data: stethBalance, initialLoading: isStethBalanceLoading } =
    useTokenBalance(
      getTokenAddress(chainId || 1, TOKENS.STETH),
      address,
      STRATEGY_LAZY,
    );
  const hasSteth = stethBalance?.gt(Zero);

  if (isWalletConnected && !isSupportedChain)
    return <RewardsListsUnsupportedChain />;

  if (!data && !initialLoading && !error) return <RewardsListsEmpty />;

  // showing loading when canceling requests and empty response
  if (
    (!data && !error) ||
    (initialLoading && !data?.events.length) ||
    isStethBalanceLoading
  ) {
    return (
      <>
        <Divider indents="lg" />
        <LoaderWrapper>
          <Loader />
        </LoaderWrapper>
      </>
    );
  }

  if (error) {
    return (
      <ErrorWrapper>
        <RewardsListErrorMessage error={error} />
      </ErrorWrapper>
    );
  }

  if (data && data.events.length === 0)
    return <ErrorBlockNoSteth hasSteth={hasSteth} />;

  return (
    <TableWrapperStyle data-testid="rewardsContent">
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
