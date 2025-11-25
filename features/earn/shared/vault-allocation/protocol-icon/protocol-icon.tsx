import { FC } from 'react';

import {
  EthereumIcon,
  BaseIcon,
  ArbitrumIcon,
  LineaIcon,
  KatanaIcon,
  PlasmaIcon,
} from 'assets/earn';

import { Container, Badge, Content } from './styles';

type ProtocolIconProps = {
  main: JSX.Element;
  badge: string;
};

export const ICONS_BADGE_MAP = {
  ethereum: <EthereumIcon />,
  base: <BaseIcon />,
  arbitrum: <ArbitrumIcon />,
  linea: <LineaIcon />,
  katana: <KatanaIcon />,
  plasma: <PlasmaIcon />,
};

export const ProtocolIcon: FC<ProtocolIconProps> = ({
  main: mainIcon,
  badge,
}) => {
  const badgeIcon =
    ICONS_BADGE_MAP[badge.toLowerCase() as keyof typeof ICONS_BADGE_MAP];

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
