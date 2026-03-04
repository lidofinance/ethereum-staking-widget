import { FC } from 'react';

import { TokenEthIcon } from 'assets/earn-v2';
import {
  SparkIcon,
  AaveV3Icon,
  EulerIcon,
  MorphoIcon,
  MapleIcon,
  GearboxIcon,
  SteakhouseIcon,
  SentoraIcon,
  SkyIcon,
  FelixIcon,
  MonadIcon,
  BaseIcon,
  HyperliquidIcon,
  HyperlendIcon,
} from 'assets/earn';

import { Container, Badge, Content } from './styles';

type StrategyIconProps = {
  mainIcon: string;
  badge: string;
};

const PROTOCOL_ICONS = {
  Aave: <AaveV3Icon />,
  Spark: <SparkIcon />,
  Maple: <MapleIcon />,
  Gearbox: <GearboxIcon />,
  Steakhouse: <SteakhouseIcon />,
  Sentora: <SentoraIcon />,
  Sky: <SkyIcon />,
  Morpho: <MorphoIcon />,
  Felix: <FelixIcon />,
  Euler: <EulerIcon />,
  Hyperlend: <HyperlendIcon />,
};

export const ICONS_BADGE_MAP = {
  ethereum: <TokenEthIcon />,
  monad: <MonadIcon />,
  base: <BaseIcon />,
  hyperliquid: <HyperliquidIcon />,
};

export const StrategyIcon: FC<StrategyIconProps> = ({ mainIcon, badge }) => {
  const badgeIcon =
    ICONS_BADGE_MAP[badge.toLowerCase() as keyof typeof ICONS_BADGE_MAP];
  const protocolIcon = PROTOCOL_ICONS[mainIcon as keyof typeof PROTOCOL_ICONS];

  if (!protocolIcon || !badgeIcon) return null;

  return (
    <Container>
      <Content>{protocolIcon}</Content>
      <Badge>
        <Content>{badgeIcon}</Content>
      </Badge>
    </Container>
  );
};
