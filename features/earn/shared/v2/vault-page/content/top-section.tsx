import type { ComponentType, FC, SVGProps } from 'react';

import {
  FormatLargeAmount,
  FormatPercent,
  FormatToken,
} from 'shared/formatters';
import { FormatPrice } from 'shared/formatters/format-price';
import { InlineLoader } from 'features/earn/shared/inline-loader';
import { VaultTip } from 'features/earn/shared/vault-tip';
import { Badge } from 'features/earn/shared/badge';
import { getTokenDecimals } from 'utils/token-decimals';

import {
  TopSectionStyled,
  TopSectionContent,
  TopSectionHeader,
  TopSectionHeaderIcon,
  TopSectionHeaderTitle,
  TopSectionDescription,
  TopSectionStatsRow,
  TopSectionStatItem,
  TopSectionStatLabel,
  TopSectionStatSubValue,
  TopSectionStatValue,
} from './styles';

type VaultIllustration = ComponentType<SVGProps<SVGSVGElement>>;

export type VaultBalanceProp = {
  amount?: bigint;
  symbol: string;
  sharesAmount?: bigint;
  sharesSymbol: string;
  usdAmount?: number;
  isLoading?: boolean;
};

type TopSectionProps = {
  logo: VaultIllustration;
  title: string;
  description: string;
  apx?: number | null;
  tvlUsd?: number | null;
  apxHint?: React.ReactNode;
  isApxLoading?: boolean;
  isTvlLoading?: boolean;
  protectedBadgeTooltipText?: React.ReactNode;
  balance?: VaultBalanceProp;
};

export const TopSection: FC<TopSectionProps> = (props) => {
  const {
    title,
    description,
    apx,
    tvlUsd,
    apxHint,
    isApxLoading,
    isTvlLoading,
    protectedBadgeTooltipText,
    balance,
  } = props;

  return (
    <TopSectionStyled>
      <TopSectionContent>
        <TopSectionHeader>
          <TopSectionHeaderIcon aria-hidden>
            <props.logo />
          </TopSectionHeaderIcon>
          <TopSectionHeaderTitle>{title}</TopSectionHeaderTitle>
          {protectedBadgeTooltipText && (
            <Badge text="PROTECTED" tooltipText={protectedBadgeTooltipText} />
          )}
        </TopSectionHeader>
        <TopSectionDescription>{description}</TopSectionDescription>
      </TopSectionContent>
      <TopSectionStatsRow>
        <TopSectionStatItem>
          <TopSectionStatLabel>
            APY* (7d avg.)
            <VaultTip placement="bottom">{apxHint}</VaultTip>
          </TopSectionStatLabel>
          <TopSectionStatValue $accent>
            <InlineLoader isLoading={isApxLoading} width={70}>
              <FormatPercent value={apx} decimals="percent" />
            </InlineLoader>
          </TopSectionStatValue>
        </TopSectionStatItem>
        <TopSectionStatItem>
          <TopSectionStatLabel>TVL</TopSectionStatLabel>
          <TopSectionStatValue>
            <InlineLoader isLoading={isTvlLoading} width={70}>
              <FormatLargeAmount amount={tvlUsd} />
            </InlineLoader>
          </TopSectionStatValue>
        </TopSectionStatItem>
        {!!balance?.sharesAmount && (
          <TopSectionStatItem>
            <TopSectionStatLabel>
              My balance
              <VaultTip placement="bottom">
                You hold{' '}
                <FormatToken
                  trimEllipsis
                  amount={balance.sharesAmount}
                  symbol={balance.sharesSymbol}
                  decimals={getTokenDecimals(balance.sharesSymbol)}
                />
                .{' '}
                {balance.usdAmount != null
                  ? `Shown in ${balance.symbol} and USD at current conversion rates.`
                  : `Shown in ${balance.symbol} at current conversion rates.`}
              </VaultTip>
            </TopSectionStatLabel>
            <TopSectionStatValue>
              <InlineLoader isLoading={balance.isLoading} width={70}>
                <FormatToken
                  trimEllipsis
                  amount={balance.amount}
                  symbol={balance.symbol}
                  decimals={getTokenDecimals(balance.symbol)}
                />
              </InlineLoader>
            </TopSectionStatValue>
            {!balance.isLoading && balance.usdAmount != null && (
              <TopSectionStatSubValue>
                <FormatPrice amount={balance.usdAmount} />
              </TopSectionStatSubValue>
            )}
          </TopSectionStatItem>
        )}
      </TopSectionStatsRow>
    </TopSectionStyled>
  );
};
