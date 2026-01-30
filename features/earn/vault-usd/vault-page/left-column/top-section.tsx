import type { ComponentType, FC, SVGProps } from 'react';

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
  illustration: VaultIllustration;
  title: string;
  description: string;
  apy: string;
  tvl: string;
};

export const TopSection: FC<TopSectionProps> = (props) => {
  const { title, description, apy, tvl } = props;

  return (
    <TopSectionStyled>
      <TopSectionContent>
        <TopSectionHeader>
          <TopSectionHeaderIcon aria-hidden>
            <props.illustration />
          </TopSectionHeaderIcon>
          <TopSectionHeaderTitle>{title}</TopSectionHeaderTitle>
        </TopSectionHeader>
        <TopSectionDescription>{description}</TopSectionDescription>
      </TopSectionContent>
      <TopSectionStatsRow>
        <TopSectionStatItem>
          <TopSectionStatLabel>APY (7d avg.)</TopSectionStatLabel>
          <TopSectionStatValue $accent>{apy}</TopSectionStatValue>
        </TopSectionStatItem>
        <TopSectionStatItem>
          <TopSectionStatLabel>Total TVL</TopSectionStatLabel>
          <TopSectionStatValue>{tvl}</TopSectionStatValue>
        </TopSectionStatItem>
      </TopSectionStatsRow>
    </TopSectionStyled>
  );
};
