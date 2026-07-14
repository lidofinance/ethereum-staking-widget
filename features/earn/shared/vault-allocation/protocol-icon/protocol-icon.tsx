import { FC } from 'react';

import { Container, Badge, Content } from './styles';
import { getAllocationChainIcon } from './chain-icon-library';

type ProtocolIconProps = {
  mainIcon: React.ReactNode;
  badge: string;
};

export const ProtocolIcon: FC<ProtocolIconProps> = ({ mainIcon, badge }) => {
  const BadgeIcon = getAllocationChainIcon(badge);

  if (!mainIcon || !BadgeIcon) return null;

  return (
    <Container>
      <Content>{mainIcon}</Content>
      <Badge>
        <Content>
          <BadgeIcon />
        </Content>
      </Badge>
    </Container>
  );
};
