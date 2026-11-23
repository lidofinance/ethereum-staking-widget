import { useCallback, useEffect, useState, type FC } from 'react';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { useThemeToggle } from '@lidofinance/lido-ui';
import { Divider, Tabs } from '@lidofinance/lido-app-ui';

import {
  POSITIONS_TTL_MS,
  TRANSACTIONS_TTL_MS,
} from 'utilsApi/portfolio/cache-ttl';

import {
  Activity,
  AssetsTable,
  PortfolioHeader,
  PortfolioNotConnected,
  PortfolioSummary,
  TokenDrawer,
  UpdateInfo,
} from './components';
import { LIDO_COLOR, OTHER_COLOR, PORTFOLIO_QUERY_SCOPE } from './consts';
import {
  ACTIVITY_TAB,
  OVERVIEW_TAB,
  usePortfolio,
  usePortfolioRoute,
  usePortfolioTransactions,
  useWalletResolving,
  type PortfolioTab,
} from './hooks';
import type { PortfolioRow } from './types';
import {
  clearSnapshots,
  getOtherEmptyText,
  getPortfolioNotice,
  isRefreshQuery,
  getRowId,
} from './utils';
import {
  PortfolioBody,
  PortfolioCard,
  PortfolioRoot,
  TabsRow,
  TabsUpdate,
} from './styles';

const TABS = [
  { value: OVERVIEW_TAB, label: 'Overview' },
  { value: ACTIVITY_TAB, label: 'Activity' },
];

const PORTFOLIO_QUERY_KEY = [PORTFOLIO_QUERY_SCOPE];
const TRANSACTIONS_QUERY_KEY = [PORTFOLIO_QUERY_SCOPE, 'transactions'];

export const Portfolio: FC = () => {
  // app-ui tokens follow data-lido-theme, the app theme lives in lido-ui
  const { themeName } = useThemeToggle();
  const {
    tab,
    tokenId: selectedTokenId,
    openTab,
    openToken,
    closeToken,
    dropToken,
  } = usePortfolioRoute();
  const { address, isAccessPending, lido, other, summary } = usePortfolio();
  // skeletons, not the connect screen, while auto-connect may still land
  const isWalletResolving = useWalletResolving();
  const isResolving = !address && (isWalletResolving || isAccessPending);
  const showWallet = !!address || isResolving;
  // no wallet for sure: its saved answers go too
  useEffect(() => {
    if (!showWallet) clearSnapshots();
  }, [showWallet]);
  // re-read on refresh, so the drawer shows fresh numbers
  const selectedRow = [...lido.rows, ...other.rows].find(
    (row) => getRowId(row) === selectedTokenId,
  );
  // history is an upstream call: the Activity tab or a click in the drawer asks for it
  const [historyWallet, setHistoryWallet] = useState<string>();
  const history = usePortfolioTransactions(
    address,
    tab === ACTIVITY_TAB || (!!address && historyWallet === address),
  );
  const queryClient = useQueryClient();
  // the slow API reads only, not the chain polling or the history
  const isRefreshQueryFetching =
    useIsFetching({ predicate: isRefreshQuery }) > 0;

  const handleSelect = useCallback(
    (row: PortfolioRow) => openToken(getRowId(row)),
    [openToken],
  );

  const isRowsLoaded = !!address && !lido.isLoading && !other.isLoading;
  useEffect(() => {
    if (selectedTokenId !== null && isRowsLoaded && !selectedRow) dropToken();
  }, [selectedTokenId, isRowsLoaded, selectedRow, dropToken]);

  const [refreshCount, setRefreshCount] = useState(0);
  // the line beside the tabs is about the open tab: its age and its refresh
  const isActivity = tab === ACTIVITY_TAB;
  const handleRefresh = useCallback(() => {
    if (isActivity) {
      setRefreshCount((previousCount) => previousCount + 1);
      // history starts again from its first page instead of re-reading every page
      void queryClient.resetQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      return;
    }
    void queryClient.invalidateQueries({
      queryKey: PORTFOLIO_QUERY_KEY,
      predicate: (query) => query.queryKey[1] !== 'transactions',
    });
  }, [queryClient, isActivity]);
  // nothing to refresh while the first portion of the history is on its way
  const canRefreshTab = !isActivity || history.isLoaded || history.isError;

  const overviewContent = showWallet ? (
    <>
      <PortfolioSummary
        summary={summary}
        isLoading={isResolving || lido.isLoading || other.isLoading}
        isRewardsLoading={lido.isRewardsLoading}
        notice={getPortfolioNotice({
          isLimited: other.isLimited,
          isFallback: other.isFallback,
          isFallbackEmpty: other.isFallbackEmpty,
          isStale: other.isStale,
          updatedAt: other.updatedAt,
          isError: lido.isError || other.isError,
          isIncomplete: other.dataIncomplete,
          isRewardsError: lido.isRewardsError,
          isRewardsStale: lido.isRewardsStale,
          rewardsUpdatedAt: lido.rewardsUpdatedAt,
        })}
      />
      <Divider />
      <AssetsTable
        title="Lido positions"
        share={summary.lidoShare}
        shareColor={LIDO_COLOR}
        totalUsd={summary.lidoUsd}
        totalRewardsUsd={summary.rewardsUsd}
        rows={lido.rows}
        isLoading={isResolving || lido.isLoading}
        isRewardsLoading={lido.isRewardsLoading}
        showRewards
        showApr
        emptyText={
          lido.isError
            ? 'Lido positions are temporarily unavailable'
            : 'No Lido positions yet'
        }
        dataTestId="portfolioLidoPositions"
        onSelect={handleSelect}
      />
      <Divider />
      <AssetsTable
        title="Other holdings"
        share={summary.otherShare}
        shareColor={OTHER_COLOR}
        totalUsd={summary.otherUsd}
        rows={other.rows}
        isLoading={isResolving || other.isLoading}
        emptyText={getOtherEmptyText(other.isError, other.isLimited)}
        showPotential
        dataTestId="portfolioOtherHoldings"
        onSelect={handleSelect}
      />
    </>
  ) : (
    <PortfolioNotConnected />
  );

  return (
    <PortfolioRoot data-lido-theme={themeName} data-testid="portfolioPage">
      <PortfolioHeader address={address} isResolving={isResolving} />
      <PortfolioBody>
        <TabsRow>
          <Tabs
            items={TABS}
            value={tab}
            onChange={(tabValue) => openTab(tabValue as PortfolioTab)}
          />
          {address && (
            <TabsUpdate>
              <UpdateInfo
                updatedAt={isActivity ? history.updatedAt : other.updatedAt}
                refreshAfterMs={
                  isActivity ? TRANSACTIONS_TTL_MS : POSITIONS_TTL_MS
                }
                isRefreshing={
                  isActivity ? history.isRefetching : isRefreshQueryFetching
                }
                onRefresh={canRefreshTab ? handleRefresh : undefined}
                dataTestId="portfolioUpdated"
              />
            </TabsUpdate>
          )}
        </TabsRow>
        <PortfolioCard>
          {tab === OVERVIEW_TAB && overviewContent}
          {tab === ACTIVITY_TAB &&
            (showWallet ? (
              // another wallet or a refresh starts from the first rows again
              <Activity
                key={`${address}:${refreshCount}`}
                history={history}
                isResolving={isResolving}
              />
            ) : (
              <PortfolioNotConnected />
            ))}
        </PortfolioCard>
      </PortfolioBody>
      <TokenDrawer
        row={selectedRow}
        history={history}
        onLoadHistory={() => setHistoryWallet(address)}
        onShowAll={() => openTab(ACTIVITY_TAB)}
        onClose={closeToken}
      />
    </PortfolioRoot>
  );
};
