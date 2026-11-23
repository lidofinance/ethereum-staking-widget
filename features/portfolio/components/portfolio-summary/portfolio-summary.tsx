import type { FC, ReactNode } from 'react';
import {
  Skeleton,
  Typography,
  type TypographyColor,
} from '@lidofinance/lido-app-ui';

import { FormatPrice } from 'shared/formatters';

import { LIDO_COLOR, OTHER_COLOR } from '../../consts';
import type { PortfolioSummary as Summary } from '../../types';
import { formatShare } from '../../utils';
import {
  Allocation,
  AllocationBar,
  AllocationBarSkeleton,
  AllocationPart,
  Legend,
  LegendItem,
  LegendSkeleton,
  NetWorth,
  SecondaryStats,
  Stat,
  SummaryStats,
  SummaryWrapper,
} from './styles';

type PortfolioSummaryProps = {
  summary: Summary;
  isLoading: boolean;
  // rewards come later than balances
  isRewardsLoading?: boolean;
  notice?: ReactNode;
};

type SecondaryStatProps = {
  label: string;
  value: ReactNode;
  color?: TypographyColor;
  dataTestId: string;
};

const SecondaryStat: FC<SecondaryStatProps> = ({
  label,
  value,
  color,
  dataTestId,
}) => (
  <Stat>
    <Typography as="span" variant="description" color="secondary">
      {label}
    </Typography>
    <Typography
      as="span"
      variant="bodyLarge"
      weight="semibold"
      color={color}
      data-testid={dataTestId}
    >
      {value}
    </Typography>
  </Stat>
);

export const PortfolioSummary: FC<PortfolioSummaryProps> = ({
  summary,
  isLoading,
  isRewardsLoading = false,
  notice,
}) => {
  const { netWorthUsd, lidoUsd, otherUsd, rewardsUsd, lidoShare, otherShare } =
    summary;
  const renderPrice = (amount: number | null, isPending = isLoading) =>
    isPending ? (
      <Skeleton variant="text" />
    ) : (
      <FormatPrice amount={amount} fallback="—" />
    );

  return (
    <SummaryWrapper data-testid="portfolioSummary">
      <SummaryStats>
        <NetWorth>
          <Typography as="span" variant="description" color="secondary">
            Net worth
          </Typography>
          <Typography
            as="span"
            color="default"
            variant="h2"
            data-testid="portfolioNetWorth"
          >
            {renderPrice(netWorthUsd)}
          </Typography>
        </NetWorth>
        <SecondaryStats>
          <SecondaryStat
            label="Lido positions"
            value={renderPrice(lidoUsd)}
            dataTestId="portfolioLidoValue"
          />
          <SecondaryStat
            label="Total rewards"
            value={renderPrice(rewardsUsd, isLoading || isRewardsLoading)}
            color="success"
            dataTestId="portfolioRewardsValue"
          />
          <SecondaryStat
            label="Other holdings"
            value={renderPrice(otherUsd)}
            color="tertiary"
            dataTestId="portfolioOtherValue"
          />
        </SecondaryStats>
      </SummaryStats>
      <Allocation>
        {isLoading ? (
          <AllocationBarSkeleton aria-hidden />
        ) : (
          <AllocationBar aria-hidden>
            <AllocationPart $share={lidoShare} $color={LIDO_COLOR} />
            <AllocationPart $share={otherShare} $color={OTHER_COLOR} />
          </AllocationBar>
        )}
        {isLoading ? (
          <LegendSkeleton>
            <Skeleton variant="text" />
          </LegendSkeleton>
        ) : (
          <Legend>
            <LegendItem $color={LIDO_COLOR}>
              <Typography as="span" color="default" variant="description">
                Lido positions{' '}
                <Typography as="span" variant="description" color="secondary">
                  ({formatShare(lidoShare)})
                </Typography>
              </Typography>
            </LegendItem>
            <LegendItem $color={OTHER_COLOR}>
              <Typography as="span" color="default" variant="description">
                Other holdings{' '}
                <Typography as="span" variant="description" color="secondary">
                  ({formatShare(otherShare)})
                </Typography>
              </Typography>
            </LegendItem>
          </Legend>
        )}
      </Allocation>
      {notice && (
        <Typography
          as="p"
          variant="description"
          color="warning"
          data-testid="portfolioNotice"
        >
          {notice}
        </Typography>
      )}
    </SummaryWrapper>
  );
};
