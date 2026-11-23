import { useRef, useState, type FC } from 'react';
import {
  Button,
  Identicon,
  Skeleton,
  Typography,
} from '@lidofinance/lido-app-ui';

import { useConfig } from 'config';
import { isDisabledPath } from 'config/external-config/disabled-path';
import { FormatPrice } from 'shared/formatters';
import { getAllocationChainIcon } from 'features/earn/shared/vault-allocation/protocol-icon/chain-icon-library';

import type { PortfolioRow } from '../../types';
import {
  ACTIVITY_LABELS,
  formatActivityDate,
  formatChainAmount,
  formatFullAmount,
  getActivityMessage,
  formatActivityTime,
  getOldestTimestamp,
  getTokenActions,
  shortenHex,
  getRowTransfer,
  getTokenTransactions,
  formatTransferAmount,
} from '../../utils';
import type { usePortfolioTransactions } from '../../hooks';
import { TokenIcon } from '../token-icon';
import { UpdateInfo } from '../update-info';
import {
  ActionLink,
  Actions,
  ActivityItem,
  ActivityMain,
  Amount,
  Balance,
  ChainName,
  ChainRow,
  DRAWER_WIDTH,
  Details,
  Identity,
  InlineParty,
  Names,
  Panel,
  Section,
} from './styles';

type TransactionsHistory = ReturnType<typeof usePortfolioTransactions>;

type TokenDrawerProps = {
  // no row: the drawer is closed
  row: PortfolioRow | undefined;
  history: TransactionsHistory;
  // loads the first portion of the history: an upstream call
  onLoadHistory: () => void;
  // opens the Activity tab
  onShowAll: () => void;
  onClose: () => void;
};

const ACTIVITY_LIMIT = 10;

type TokenActivityProps = {
  row: PortfolioRow;
  history: TransactionsHistory;
  onLoadHistory: () => void;
  onShowAll: () => void;
};

// the token's part of the loaded history; loading it is the user's click
const TokenActivity: FC<TokenActivityProps> = ({
  row,
  history,
  onLoadHistory,
  onShowAll,
}) => {
  const {
    transactions,
    isLoaded,
    isLoading,
    isError,
    isLimited,
    hasNextPage,
    updatedAt,
  } = history;
  const tokenTransactions = getTokenTransactions(transactions, row).slice(
    0,
    ACTIVITY_LIMIT,
  );
  const isRequested = isLoaded || isLoading || isError;
  const message = getActivityMessage(
    tokenTransactions.length === 0,
    isError,
    isLimited,
    'No recent activity for this token',
  );
  // older operations may lie in portions that are not loaded yet
  const sinceTimestamp = hasNextPage ? getOldestTimestamp(transactions) : null;

  return (
    <Section data-testid="portfolioDrawerActivity">
      <Typography as="h3" color="default" variant="bodyLarge" weight="semibold">
        Activity
      </Typography>
      {isLoaded && (
        <UpdateInfo
          updatedAt={updatedAt}
          dataTestId="portfolioDrawerActivityUpdated"
        />
      )}
      {!isRequested && (
        <Button
          variant="outline"
          size="small"
          onClick={onLoadHistory}
          data-testid="portfolioDrawerActivityShow"
        >
          Show activity
        </Button>
      )}
      {isLoading && <Skeleton variant="text" lines={3} />}
      {isRequested && !isLoading && message !== null && (
        <Typography as="span" variant="body" color="secondary">
          {message}
        </Typography>
      )}
      {tokenTransactions.map((transaction) => {
        const transfer = getRowTransfer(transaction, row);
        const amountSign = transfer?.direction === 'in' ? '+' : '-';
        return (
          <ActivityItem key={transaction.id}>
            <ActivityMain>
              <Typography
                as="span"
                color="default"
                variant="body"
                weight="semibold"
              >
                {ACTIVITY_LABELS[transaction.type]}
              </Typography>
              {transaction.counterparty &&
                (transaction.type === 'send' ||
                  transaction.type === 'receive') && (
                  <InlineParty>
                    <Typography
                      as="span"
                      variant="description"
                      color="secondary"
                    >
                      {transaction.type === 'send' ? 'To' : 'From'}
                    </Typography>
                    <Identicon address={transaction.counterparty} size={16} />
                    <Typography
                      as="span"
                      variant="description"
                      color="secondary"
                    >
                      {shortenHex(transaction.counterparty)}
                    </Typography>
                  </InlineParty>
                )}
              <Typography as="span" variant="description" color="secondary">
                {formatActivityTime(transaction.timestamp)}
              </Typography>
            </ActivityMain>
            {transfer && (
              <Typography as="span" color="default" variant="body">
                {amountSign}
                {formatTransferAmount(transfer.amount)}
              </Typography>
            )}
          </ActivityItem>
        );
      })}
      {sinceTimestamp !== null && (
        <Typography
          as="span"
          variant="description"
          color="secondary"
          data-testid="portfolioDrawerActivitySince"
        >
          Showing activity since {formatActivityDate(sinceTimestamp)}
        </Typography>
      )}
      {isLoaded && (
        <Button
          variant="outline"
          size="small"
          onClick={onShowAll}
          data-testid="portfolioDrawerActivityAll"
        >
          All activity
        </Button>
      )}
    </Section>
  );
};

const NetworkDistribution: FC<{ row: PortfolioRow }> = ({ row }) => (
  <Section data-testid="portfolioDrawerNetworks">
    <Typography as="h3" color="default" variant="bodyLarge" weight="semibold">
      Asset network distribution
    </Typography>
    {row.chains.map((chain) => {
      const ChainIcon = getAllocationChainIcon(chain.slug);
      return (
        <ChainRow key={`${chain.slug}-${chain.name}`}>
          <ChainName>
            <ChainIcon aria-hidden />
            <Typography as="span" color="default" variant="body">
              {chain.name}
            </Typography>
          </ChainName>
          <Typography as="span" color="default" variant="body">
            {formatChainAmount(chain)}
          </Typography>
        </ChainRow>
      );
    })}
  </Section>
);

type TokenDetailsProps = Omit<TokenDrawerProps, 'row' | 'onClose'> & {
  row: PortfolioRow;
};

const TokenDetails: FC<TokenDetailsProps> = ({
  row,
  history,
  onLoadHistory,
  onShowAll,
}) => {
  const { pages } = useConfig().externalConfig;
  const actions = getTokenActions(row.iconToken).filter(
    (action) => !isDisabledPath(action.href, pages),
  );
  const firstChain = row.chains[0];

  return (
    <Details>
      <Balance>
        <div>
          <Amount
            forwardedAs="p"
            variant="h1"
            color="default"
            data-testid="portfolioDrawerAmount"
          >
            {formatFullAmount(
              row.amount,
              row.decimals,
              row.chains.length === 1 && firstChain
                ? firstChain.amountFloat
                : null,
            )}
          </Amount>
          <Typography as="span" variant="bodyLarge" color="secondary">
            {row.valueUsd != null && '≈'}
            <FormatPrice amount={row.valueUsd} fallback="—" />
          </Typography>
        </div>
        {actions.length > 0 && (
          <Actions>
            {actions.map((action) => (
              <ActionLink
                key={action.label}
                href={action.href}
                $highlight={action.highlight}
              >
                {action.label}
              </ActionLink>
            ))}
          </Actions>
        )}
      </Balance>
      <NetworkDistribution row={row} />
      <TokenActivity
        key={row.key}
        row={row}
        history={history}
        onLoadHistory={onLoadHistory}
        onShowAll={onShowAll}
      />
    </Details>
  );
};

export const TokenDrawer: FC<TokenDrawerProps> = ({
  row,
  onClose,
  ...detailsProps
}) => {
  // the last token stays on screen while the drawer slides out
  const [shownRow, setShownRow] = useState(row);
  if (row && row !== shownRow) setShownRow(row);
  // the dialog itself takes focus, so no button lights up on open
  const panelRef = useRef<HTMLDivElement>(null);

  return (
    <Panel
      ref={panelRef}
      open={!!row}
      onClose={() => onClose()}
      width={DRAWER_WIDTH}
      labels={{ close: 'Close' }}
      initialFocus={panelRef}
      tabIndex={-1}
      data-testid="portfolioTokenDrawer"
      title={
        shownRow && (
          <Identity>
            <TokenIcon
              symbol={shownRow.symbol}
              iconToken={shownRow.iconToken}
            />
            <Names>
              <Typography
                as="span"
                color="default"
                variant="body"
                weight="semibold"
              >
                {shownRow.name}
              </Typography>
              <Typography as="span" variant="description" color="secondary">
                {shownRow.symbol}
              </Typography>
            </Names>
          </Identity>
        )
      }
    >
      {shownRow && <TokenDetails row={shownRow} {...detailsProps} />}
    </Panel>
  );
};
