import { InfoTooltip, Skeleton, Typography } from '@lidofinance/lido-app-ui';

import { FormatPercent } from 'shared/formatters/format-percent';
import { FormatPrice } from 'shared/formatters/format-price';
import { FormatToken } from 'shared/formatters/format-token';
import { getTokenDecimals } from 'utils/token-decimals';

import {
  PositionBox,
  PositionLabel,
  PositionMain,
  PositionValue,
} from './styles';
import type { VaultPositionSummary } from './types';

type VaultPositionBoxProps = {
  position: VaultPositionSummary;
  apx?: number | null;
  isApxLoading?: boolean;
};

export const VaultPositionBox = ({
  position,
  apx,
  isApxLoading,
}: VaultPositionBoxProps) => {
  const hasPosition = !!position.sharesAmount;

  return (
    <PositionBox data-testid="vault-position">
      <PositionMain>
        <PositionLabel>
          <Typography variant="description" color="secondary">
            My position
          </Typography>
          {hasPosition && (
            <InfoTooltip
              tone="tertiary"
              content={
                <>
                  You hold{' '}
                  <FormatToken
                    trimEllipsis
                    amount={position.sharesAmount}
                    symbol={position.sharesSymbol}
                    decimals={getTokenDecimals(position.sharesSymbol)}
                  />
                  . Shown at current conversion rates.
                </>
              }
            />
          )}
        </PositionLabel>
        {position.isLoading ? (
          <Skeleton variant="text" width="8em" />
        ) : hasPosition ? (
          <PositionValue>
            <Typography
              as="span"
              variant="bodyLarge"
              weight="semibold"
              data-testid="my-deposit-value"
            >
              <FormatToken
                trimEllipsis
                amount={position.amount}
                symbol={position.symbol}
                decimals={getTokenDecimals(position.symbol)}
              />
            </Typography>
            {position.usdAmount != null && (
              <Typography
                as="span"
                variant="description"
                color="secondary"
                data-testid="my-deposit-usd-value"
              >
                <FormatPrice amount={position.usdAmount} />
              </Typography>
            )}
          </PositionValue>
        ) : (
          <Typography
            as="span"
            variant="bodyLarge"
            weight="semibold"
            color="tertiary"
          >
            No position
          </Typography>
        )}
      </PositionMain>
      <Typography as="span" variant="body" weight="semibold">
        {isApxLoading ? (
          <Skeleton variant="text" width="5em" />
        ) : (
          <>
            <FormatPercent value={apx} decimals="percent" /> APY
          </>
        )}
      </Typography>
    </PositionBox>
  );
};
