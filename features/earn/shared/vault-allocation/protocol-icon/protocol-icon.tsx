import { FC } from 'react';

import {
  AaveV3Icon,
  EulerIcon,
  MorphoIcon,
  Univ3Icon,
  EthereumIcon,
  BaseIcon,
  ArbitrumIcon,
  BalancerIcon,
  EtherfiIcon,
  MerklIcon,
  LineaIcon,
} from 'assets/earn';

import { Container, Badge, Content } from './styles';

type ProtocolIconProps = {
  main: string;
  badge: string;
};

export const ICONS_MAIN_MAP = {
  'Aave V3': <AaveV3Icon />,
  Euler: <EulerIcon />,
  Morpho: <MorphoIcon />,
  'Uniswap V3': <Univ3Icon />,
  Balancer: <BalancerIcon />,
  Merkl: <MerklIcon />,
  'ether.fi': <EtherfiIcon />,
};

export const ICONS_BADGE_MAP = {
  Ethereum: <EthereumIcon />,
  Base: <BaseIcon />,
  Arbitrum: <ArbitrumIcon />,
  Linea: <LineaIcon />,
};

export const ProtocolIcon: FC<ProtocolIconProps> = ({ main, badge }) => {
  const mainIcon = ICONS_MAIN_MAP[main as keyof typeof ICONS_MAIN_MAP];
  const badgeIcon = ICONS_BADGE_MAP[badge as keyof typeof ICONS_BADGE_MAP];

  if (!mainIcon || !badgeIcon) return null;

  return (
    <Container>
      <Content>{mainIcon}</Content>
      <Badge>
        <Content>{badgeIcon}</Content>
      </Badge>
    </Container>
  );
};
