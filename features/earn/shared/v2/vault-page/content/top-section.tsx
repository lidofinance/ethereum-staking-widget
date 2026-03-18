import type { ComponentType, FC, SVGProps } from 'react';

import { FormatLargeAmount, FormatPercent } from 'shared/formatters';
import { InlineLoader } from 'features/earn/shared/inline-loader';
import { VaultTip } from 'features/earn/shared/vault-tip';
import { Badge } from 'features/earn/shared/badge';

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
  TopSectionStatValue,
} from './styles';

type VaultIllustration = ComponentType<SVGProps<SVGSVGElement>>;
type TopSectionProps = {
  logo: VaultIllustration;
  title: string;
  description: string;
  apx?: number | null;
  tvl?: number | null;
  apxHint?: React.ReactNode;
  isApxLoading?: boolean;
  isTvlLoading?: boolean;
  protectedBadgeTooltipText?: React.ReactNode;
};

export const TopSection: FC<TopSectionProps> = (props) => {
  const {
    title,
    description,
    apx,
    tvl,
    apxHint,
    isApxLoading,
    isTvlLoading,
    protectedBadgeTooltipText,
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
            APY (7d avg.)
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
              <FormatLargeAmount amount={tvl} />
            </InlineLoader>
          </TopSectionStatValue>
        </TopSectionStatItem>
      </TopSectionStatsRow>
    </TopSectionStyled>
  );
};
