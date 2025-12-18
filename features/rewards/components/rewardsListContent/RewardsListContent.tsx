import { FC, useRef } from 'react';
import { Loader, Divider } from '@lidofinance/lido-ui';
import type { Address } from 'viem';

import { useRewardsHistory } from 'features/rewards/hooks';
import { ErrorBlockNoSteth } from 'features/rewards/components/errorBlocks/ErrorBlockNoSteth';
import { RewardsTable } from 'features/rewards/components/rewardsTable';
import { useStethBalance, useDappStatus } from 'modules/web3';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_FETCH_EVENTS_TYPES } from 'consts/matomo';
import { useConfig } from 'config';
import { WarningBanner } from 'shared/banners/info-banner';

import { RewardsListsEmpty } from './RewardsListsEmpty';
import { RewardsListErrorMessage } from './RewardsListErrorMessage';
import { RewardsListsUnsupportedChain } from './RewardsListsUnsupportedChain';
import {
  LoaderWrapper,
  TableWrapperStyle,
  ErrorWrapper,
} from './RewardsListContentStyles';

export const RewardsListContent: FC = () => {
  const { isSupportedChain } = useDappStatus();
  const {
    address,
    error,
    isLoading,
    data,
    currencyObject,
    page,
    setPage,
    isLagging,
  } = useRewardsHistory();
  const isDataLoadedAndLoggedOnce = useRef(false);
  const { data: stethBalance, isLoading: isStethBalanceLoading } =
    useStethBalance({
      account: address as Address,
      shouldSubscribeToUpdates: false,
    });
  const hasSteth = !!stethBalance;
  const { featureFlags } = useConfig().externalConfig;

  if (featureFlags.rewardsMaintenance) {
    return (
      <>
        <Divider indents="lg" />
        <WarningBanner>
          The reward history service is currently undergoing maintenance.
        </WarningBanner>
      </>
    );
  }

  if (!isSupportedChain) return <RewardsListsUnsupportedChain />;

  if (!data && !isLoading && !error) return <RewardsListsEmpty />;

  // showing loading when canceling requests and empty response
  if (
    (!data && !error) ||
    (isLoading && !data?.events.length) ||
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

  const shouldShowRewardsTable = data?.events.length && !error;
  if (shouldShowRewardsTable && !isDataLoadedAndLoggedOnce.current) {
    isDataLoadedAndLoggedOnce.current = true;
    trackMatomoEvent(MATOMO_FETCH_EVENTS_TYPES.ethRewardsDashboardDownloaded);
  }

  return (
    <TableWrapperStyle data-testid="rewardsContent">
      {shouldShowRewardsTable && (
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
