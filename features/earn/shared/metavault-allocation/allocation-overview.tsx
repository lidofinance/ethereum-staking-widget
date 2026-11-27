import { Typography } from '@lidofinance/lido-app-ui';

import { FormatLargeAmount } from 'shared/formatters/format-large-amount';
import { FormatPercent } from 'shared/formatters/format-percent';

import type { AllocationChartItem } from './types';
import { getBarLabel, isShareVisible } from './utils';
import {
  Bar,
  BarBlock,
  BarSegment,
  Legend,
  LegendDot,
  LegendItem,
  LegendText,
  Overview,
  Total,
} from './styles';

type AllocationOverviewProps = {
  totalTvlUsd?: number;
  chartData: AllocationChartItem[];
};

export const AllocationOverview = ({
  totalTvlUsd,
  chartData,
}: AllocationOverviewProps) => (
  <Overview>
    <Total data-testid="allocation-total">
      <Typography as="span" variant="h3">
        <FormatLargeAmount amount={totalTvlUsd} />
      </Typography>
      <Typography as="span" variant="description" color="secondary">
        Total TVL
      </Typography>
    </Total>
    {chartData.length > 0 && (
      <BarBlock>
        <Bar
          role="img"
          aria-label={getBarLabel(chartData)}
          data-testid="allocation-chart"
        >
          {chartData.map((item, index) => (
            <BarSegment
              key={`${item.name}-${index}`}
              style={{ flexGrow: item.allocation, backgroundColor: item.color }}
            />
          ))}
        </Bar>
        <Legend data-testid="allocation-legend">
          {chartData.map((item, index) => (
            <LegendItem key={`${item.name}-${index}`}>
              <LegendDot style={{ backgroundColor: item.color }} />
              <LegendText>
                <Typography as="span" variant="description" color="default">
                  {item.name}
                </Typography>
                {isShareVisible(item) && (
                  <Typography as="span" variant="description" color="tertiary">
                    <FormatPercent value={item.allocation} decimals="percent" />
                  </Typography>
                )}
              </LegendText>
            </LegendItem>
          ))}
        </Legend>
      </BarBlock>
    )}
  </Overview>
);
