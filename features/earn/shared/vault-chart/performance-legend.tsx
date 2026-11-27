import { Fragment } from 'react';
import { Skeleton, Typography } from '@lidofinance/lido-app-ui';

import type { LegendItem } from './utils';
import {
  LegendDivider,
  LegendDot,
  LegendItemRoot,
  LegendRow,
  LegendValues,
} from './styles';

type PerformanceLegendProps = {
  items: LegendItem[];
  isLoading: boolean;
};

export const PerformanceLegend = ({
  items,
  isLoading,
}: PerformanceLegendProps) => (
  <LegendRow data-testid="performance-legend">
    {items.map(({ key, label, color, values }) => {
      // Hide a series that has no data after the load (for example, an API error)
      if (!values && !isLoading) return null;

      return (
        <LegendItemRoot key={key} data-testid={`legend-${key}`}>
          <LegendDot $color={color} />
          <Typography as="span" variant="body" weight="semibold">
            {label}
          </Typography>
          {values ? (
            <LegendValues>
              {values.map((value, index) => (
                <Fragment key={value}>
                  {index > 0 && <LegendDivider />}
                  <Typography as="span" variant="body" color="secondary">
                    {value}
                  </Typography>
                </Fragment>
              ))}
            </LegendValues>
          ) : (
            <Skeleton width={48} height={16} />
          )}
        </LegendItemRoot>
      );
    })}
  </LegendRow>
);
