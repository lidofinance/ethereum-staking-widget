import { useState, type FC } from 'react';
import {
  Button,
  EmptyState,
  IconArrowRight,
  Skeleton,
  Typography,
} from '@lidofinance/lido-app-ui';

import {
  ACTIVITY_LABELS,
  formatActivityDay,
  getActivityMessage,
  getStaleNotice,
} from '../../utils';
import type { usePortfolioTransactions } from '../../hooks';
import { PartyCell, TransferCell } from './parts';
import { ActivityWrapper, Arrow, Message, Table, Td, Th } from './styles';

const ACTIVITY_CHUNK = 10;
const SKELETON_ROWS = 5;

type ActivityProps = {
  history: ReturnType<typeof usePortfolioTransactions>;
  // the wallet may still auto-connect
  isResolving?: boolean;
};

export const Activity: FC<ActivityProps> = ({
  history,
  isResolving = false,
}) => {
  const {
    transactions,
    isLoading,
    isError,
    isLimited,
    isStale,
    updatedAt,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = history;
  const [visibleCount, setVisibleCount] = useState(ACTIVITY_CHUNK);

  const visibleTransactions = transactions.slice(0, visibleCount);
  const hasHiddenTransactions = transactions.length > visibleCount;
  const canShowMore = hasHiddenTransactions || hasNextPage;

  // one upstream portion per click, never on its own
  const showMore = () => {
    const shownCount = Math.min(visibleCount, transactions.length);
    setVisibleCount(shownCount + ACTIVITY_CHUNK);
    if (!hasHiddenTransactions && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage({ cancelRefetch: false });
    }
  };

  // an empty list shows skeletons while the clicked portion loads
  const isPageLoading =
    isResolving ||
    isLoading ||
    (visibleTransactions.length === 0 && isFetchingNextPage);

  const message = getActivityMessage(
    visibleTransactions.length === 0,
    isError,
    isLimited,
    'No activity found',
  );

  return (
    <ActivityWrapper data-testid="portfolioActivity">
      {isStale && !isPageLoading && (
        <Typography
          as="p"
          variant="description"
          color="warning"
          data-testid="portfolioActivityNotice"
        >
          {getStaleNotice(updatedAt, 'activity')}
        </Typography>
      )}
      <Table>
        <thead>
          <tr>
            <Th $width={100} $mobileWidth={60}>
              Time
            </Th>
            <Th $width={100} $mobileWidth={84}>
              Type
            </Th>
            <Th>Amount</Th>
            <Th $width={40} $hideOnPhone aria-hidden />
            <Th $hideOnPhone aria-hidden />
            <Th $width={150} $desktopOnly>
              Address
            </Th>
          </tr>
        </thead>
        <tbody>
          {isPageLoading &&
            Array.from({ length: SKELETON_ROWS }, (_, index) => (
              <tr key={index}>
                <Td colSpan={6}>
                  <Skeleton variant="text" fill />
                </Td>
              </tr>
            ))}
          {!isPageLoading &&
            visibleTransactions.map((transaction) => {
              const [firstTransfer, secondTransfer] = transaction.transfers;
              return (
                <tr key={transaction.id} data-testid="portfolioActivityRow">
                  <Td>
                    <Typography as="span" color="default" variant="body">
                      {formatActivityDay(transaction.timestamp)}
                    </Typography>
                  </Td>
                  <Td>
                    <Typography as="span" color="default" variant="body">
                      {ACTIVITY_LABELS[transaction.type]}
                    </Typography>
                  </Td>
                  <Td>
                    <TransferCell
                      transfer={firstTransfer}
                      transaction={transaction}
                    />
                  </Td>
                  <Td $hideOnPhone>
                    {secondTransfer && (
                      <Arrow aria-label="to">
                        <IconArrowRight aria-hidden />
                      </Arrow>
                    )}
                  </Td>
                  <Td $hideOnPhone>
                    {secondTransfer && (
                      <TransferCell
                        transfer={secondTransfer}
                        transaction={transaction}
                      />
                    )}
                  </Td>
                  <Td $desktopOnly>
                    <PartyCell transaction={transaction} />
                  </Td>
                </tr>
              );
            })}
        </tbody>
      </Table>

      {!isPageLoading && visibleTransactions.length === 0 && (
        <EmptyState
          description={message}
          action={
            canShowMore && (
              <Button
                variant="outline"
                size="small"
                loading={isFetchingNextPage}
                disabled={isFetchingNextPage}
                onClick={showMore}
                data-testid="portfolioActivityShowMore"
              >
                Show more
              </Button>
            )
          }
          dataTestId={{ description: 'portfolioActivityMessage' }}
        />
      )}
      {!isPageLoading &&
        visibleTransactions.length > 0 &&
        (message !== null || canShowMore) && (
          <Message>
            {message !== null && !isFetchingNextPage && (
              <Typography
                as="span"
                variant="body"
                color="secondary"
                data-testid="portfolioActivityMessage"
              >
                {message}
              </Typography>
            )}
            {canShowMore && (
              <Button
                variant="outline"
                size="small"
                loading={isFetchingNextPage}
                disabled={isFetchingNextPage}
                onClick={showMore}
                data-testid="portfolioActivityShowMore"
              >
                Show more
              </Button>
            )}
          </Message>
        )}
    </ActivityWrapper>
  );
};
