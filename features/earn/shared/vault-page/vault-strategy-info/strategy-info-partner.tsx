import type { ReactNode } from 'react';
import { IconLink } from '@lidofinance/lido-app-ui';

import { PartnerLink, PartnerValue } from './styles';

type StrategyInfoPartnerProps = {
  icon: ReactNode;
  name: string;
  href: string;
};

// a partner (curator, auditor) with its logo and an external link
export const StrategyInfoPartner = ({
  icon,
  name,
  href,
}: StrategyInfoPartnerProps) => (
  <PartnerValue>
    {icon}
    <PartnerLink href={href} icon={<IconLink />}>
      {name}
    </PartnerLink>
  </PartnerValue>
);
