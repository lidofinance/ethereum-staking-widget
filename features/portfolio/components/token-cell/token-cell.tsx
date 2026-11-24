import type { FC, ReactNode } from 'react';
import { Typography } from '@lidofinance/lido-app-ui';

import type { PortfolioRow } from '../../types';
import { DesktopOnly, MobileOnly } from '../../styles';
import { TokenIcon } from '../token-icon';
import { TokenCellWrapper, TokenNames } from './styles';

type TokenCellProps = Pick<
  PortfolioRow,
  'symbol' | 'name' | 'iconToken' | 'chains'
> & {
  // phones show the amount in place of the name, as in the design
  amount: ReactNode;
};

export const TokenCell: FC<TokenCellProps> = ({
  symbol,
  name,
  iconToken,
  chains,
  amount,
}) => (
  <TokenCellWrapper>
    <TokenIcon symbol={symbol} iconToken={iconToken} chains={chains} />
    <TokenNames>
      <Typography
        as="span"
        color="default"
        variant="body"
        weight="semibold"
        truncate
      >
        <DesktopOnly>{name}</DesktopOnly>
        <MobileOnly>{amount}</MobileOnly>
      </Typography>
      <Typography as="span" variant="description" color="secondary" truncate>
        {symbol}
      </Typography>
    </TokenNames>
  </TokenCellWrapper>
);
