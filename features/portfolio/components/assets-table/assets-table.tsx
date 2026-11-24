import { useState, type FC, type MouseEvent, type ReactNode } from 'react';
import {
  Button,
  IconChevronDown,
  IconChevronUp,
  Skeleton,
  Typography,
} from '@lidofinance/lido-app-ui';
// the same hint glyph as on the other pages
import { Question } from '@lidofinance/lido-ui';

import { FormatPercent, FormatPrice, FormatToken } from 'shared/formatters';

import type { PortfolioRow } from '../../types';
import { DesktopOnly, MobileOnly } from '../../styles';
import {
  formatAprRange,
  formatRewardsAmount,
  formatShare,
  formatTransferAmount,
} from '../../utils';
import { ShareRing } from '../share-ring';
import { RowMenu } from '../row-menu';
import { TokenCell } from '../token-cell';
import {
  CellStack,
  CollapseToggle,
  HintIcon,
  Collapsible,
  MoreCell,
  MoreHead,
  Row,
  Share,
  SkeletonAsset,
  SkeletonLines,
  Table,
  TableFooter,
  TableSection,
  TableTitle,
  TableTitleEnd,
  TableTitleStart,
  Td,
  Th,
  ThLabel,
} from './styles';

const PAGE_SIZE = 10;
const REWARDS_HINT =
  'Rewards earned on your current positions since April 2022. USD values are based on monthly prices, so they may differ slightly from other sources.';
const SKELETON_ROWS = 5;
const TOTAL_SKELETON_WIDTH = 96;
const ICON_SIZE = 32;

type AssetsTableProps = {
  title: string;
  share: number;
  shareColor: string;
  totalUsd: number;
  totalRewardsUsd?: number | null;
  rows: PortfolioRow[];
  isLoading: boolean;
  // rewards come later than balances, their cells wait on their own
  isRewardsLoading?: boolean;
  showRewards?: boolean;
  showApr?: boolean;
  showPotential?: boolean;
  emptyText: ReactNode;
  dataTestId: string;
  onSelect?: (row: PortfolioRow) => void;
  // off for the blurred preview, which takes no input
  collapsible?: boolean;
};

const RowAmount: FC<{ row: PortfolioRow }> = ({ row }) => {
  const [firstChain] = row.chains;
  // positions without raw units still have a float amount for one chain
  if (
    row.amount == null &&
    row.chains.length === 1 &&
    firstChain?.amountFloat
  ) {
    return <>{formatTransferAmount(firstChain.amountFloat)}</>;
  }
  return <FormatToken amount={row.amount} decimals={row.decimals} symbol="" />;
};

type RewardsCellProps = { row: PortfolioRow; isLoading: boolean };

const RewardsCell: FC<RewardsCellProps> = ({ row, isLoading }) => {
  if (row.rewardsUsd == null && isLoading) {
    return (
      <SkeletonLines $end data-testid="portfolioRewardsSkeleton">
        <Skeleton variant="text" />
      </SkeletonLines>
    );
  }
  return row.rewardsUsd == null ? (
    <Typography as="span" color="default" variant="body">
      —
    </Typography>
  ) : (
    <CellStack>
      {row.rewardsAmount != null && (
        <Typography as="span" color="default" variant="body">
          {formatRewardsAmount(row.rewardsAmount)} {row.rewardsSymbol}
        </Typography>
      )}
      <Typography as="span" variant="description" color="secondary">
        <FormatPrice amount={row.rewardsUsd} fallback="—" />
      </Typography>
    </CellStack>
  );
};

type AmountCellProps = { row: PortfolioRow; showRewards: boolean };

const AmountCell: FC<AmountCellProps> = ({ row, showRewards }) => (
  <CellStack>
    <DesktopOnly>
      <Typography as="span" color="default" variant="body">
        <RowAmount row={row} />
      </Typography>
    </DesktopOnly>
    <DesktopOnly>
      <Typography as="span" variant="description" color="secondary">
        <FormatPrice amount={row.valueUsd} fallback="—" />
      </Typography>
    </DesktopOnly>
    <MobileOnly>
      <Typography as="span" color="default" variant="body">
        <FormatPrice amount={row.valueUsd} fallback="—" />
      </Typography>
    </MobileOnly>
    {showRewards && row.rewardsUsd != null && (
      <MobileOnly>
        <Typography as="span" variant="description" color="success">
          +<FormatPrice amount={row.rewardsUsd} fallback="—" />
        </Typography>
      </MobileOnly>
    )}
  </CellStack>
);

export const AssetsTable: FC<AssetsTableProps> = ({
  title,
  share,
  shareColor,
  totalUsd,
  totalRewardsUsd,
  rows,
  isLoading,
  isRewardsLoading = false,
  showRewards = false,
  showApr = false,
  showPotential = false,
  emptyText,
  dataTestId,
  onSelect,
  collapsible = true,
}) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const visibleRows = rows.slice(0, visibleCount);
  const hasMenu = !!onSelect;
  const columnsCount =
    2 +
    Number(showRewards) +
    Number(showApr) +
    Number(showPotential) +
    Number(hasMenu);

  const openRow = (row: PortfolioRow) => (event: MouseEvent<HTMLElement>) => {
    // clicks from the row menu portal bubble here through React, not the DOM
    if (!event.currentTarget.contains(event.target as Node)) return;
    onSelect?.(row);
  };

  return (
    <TableSection data-testid={dataTestId}>
      <TableTitle>
        <TableTitleStart>
          <Typography
            as="h3"
            color="default"
            variant="bodyLarge"
            weight="semibold"
          >
            {title}
          </Typography>
          {!isLoading && (
            <Share>
              <Typography as="span" variant="description" color="secondary">
                {formatShare(share)}
              </Typography>
              <ShareRing share={share} color={shareColor} />
            </Share>
          )}
          {collapsible && (
            <CollapseToggle
              type="button"
              aria-label={isCollapsed ? `Expand ${title}` : `Collapse ${title}`}
              aria-expanded={!isCollapsed}
              onClick={() => setIsCollapsed((wasCollapsed) => !wasCollapsed)}
            >
              {isCollapsed ? <IconChevronDown /> : <IconChevronUp />}
            </CollapseToggle>
          )}
        </TableTitleStart>
        <TableTitleEnd>
          {isLoading && (
            <Skeleton variant="text" width={TOTAL_SKELETON_WIDTH} />
          )}
          {!isLoading && totalRewardsUsd != null && totalRewardsUsd > 0 && (
            <Typography
              as="span"
              variant="bodyLarge"
              weight="semibold"
              color="success"
            >
              +<FormatPrice amount={totalRewardsUsd} fallback="—" />
            </Typography>
          )}
          {!isLoading && (
            <Typography
              as="span"
              color="default"
              variant="bodyLarge"
              weight="semibold"
            >
              <FormatPrice amount={totalUsd} fallback="—" />
            </Typography>
          )}
        </TableTitleEnd>
      </TableTitle>

      <Collapsible $collapsed={isCollapsed}>
        <Table>
          <thead>
            <tr>
              <Th $align="left">Asset</Th>
              {showRewards && (
                <Th $optional>
                  <ThLabel>
                    Lifetime rewards
                    <HintIcon content={REWARDS_HINT} icon={<Question />} />
                  </ThLabel>
                </Th>
              )}
              {showApr && <Th $optional>APR / APY</Th>}
              {showPotential && (
                <Th $lastOnMobile $wrapOnMobile>
                  Potential earning, APR
                </Th>
              )}
              <Th $optional={showPotential} $lastOnMobile={!showPotential}>
                <DesktopOnly>Amount</DesktopOnly>
                <MobileOnly>
                  {showRewards ? 'Value / Rewards' : 'Value'}
                </MobileOnly>
              </Th>
              {hasMenu && <MoreHead aria-hidden />}
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: SKELETON_ROWS }, (_, index) => (
                <tr key={index} data-testid="portfolioRowSkeleton">
                  <Td $align="left">
                    <SkeletonAsset>
                      <Skeleton
                        variant="circle"
                        width={ICON_SIZE}
                        height={ICON_SIZE}
                      />
                      <SkeletonLines>
                        <Skeleton variant="text" />
                        <Skeleton variant="text" />
                      </SkeletonLines>
                    </SkeletonAsset>
                  </Td>
                  <Td colSpan={columnsCount - 1}>
                    <SkeletonLines $end>
                      <Skeleton variant="text" />
                      <Skeleton variant="text" />
                    </SkeletonLines>
                  </Td>
                </tr>
              ))}
            {!isLoading && rows.length === 0 && (
              <tr>
                <Td $align="left" colSpan={columnsCount}>
                  <Typography as="span" variant="description" color="secondary">
                    {emptyText}
                  </Typography>
                </Td>
              </tr>
            )}
            {!isLoading &&
              visibleRows.map((row) => (
                <Row
                  key={row.key}
                  data-testid="portfolioRow"
                  onClick={hasMenu ? openRow(row) : undefined}
                >
                  <Td $align="left">
                    <TokenCell
                      symbol={row.symbol}
                      name={row.name}
                      iconToken={row.iconToken}
                      chains={row.chains}
                      amount={<RowAmount row={row} />}
                    />
                  </Td>
                  {showRewards && (
                    <Td $optional>
                      <RewardsCell row={row} isLoading={isRewardsLoading} />
                    </Td>
                  )}
                  {showApr && (
                    <Td $optional>
                      <Typography
                        as="span"
                        variant="body"
                        weight="semibold"
                        color="success"
                      >
                        <FormatPercent
                          value={row.apr}
                          decimals="percent"
                          fallback="—"
                        />
                      </Typography>
                    </Td>
                  )}
                  {showPotential && (
                    <Td>
                      <Typography
                        as="span"
                        variant="body"
                        color={row.potentialApr ? 'success' : 'tertiary'}
                      >
                        {row.potentialApr
                          ? formatAprRange(row.potentialApr)
                          : '—'}
                      </Typography>
                    </Td>
                  )}
                  <Td $optional={showPotential}>
                    <AmountCell row={row} showRewards={showRewards} />
                  </Td>
                  {hasMenu && (
                    <MoreCell>
                      <RowMenu row={row} onDetails={() => onSelect?.(row)} />
                    </MoreCell>
                  )}
                </Row>
              ))}
          </tbody>
        </Table>

        {!isLoading && rows.length > visibleCount && (
          <TableFooter>
            <Button
              variant="outline"
              size="small"
              onClick={() =>
                setVisibleCount((previousCount) => previousCount + PAGE_SIZE)
              }
            >
              Load more
            </Button>
          </TableFooter>
        )}
      </Collapsible>
    </TableSection>
  );
};
