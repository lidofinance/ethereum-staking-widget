import { FC, HTMLAttributes, SVGProps } from 'react';
import Link from 'next/link';
import { LidoLogo } from '@lidofinance/lido-ui';

import { LogoLDOPLStyle, LogoLDOStyle, LogoLidoStyle } from './styles';

export type LogoComponent = FC<Omit<SVGProps<SVGSVGElement>, 'ref'>>;

export const LogoLDO: LogoComponent = (props) => {
  return <LogoLDOStyle {...props} />;
};

export const LogoLDOPL: LogoComponent = (props) => {
  return <LogoLDOPLStyle {...props} />;
};

export const LogoLido: FC<HTMLAttributes<HTMLDivElement>> = (props) => (
  <LogoLidoStyle {...props}>
    <Link href="https://lido.fi">
      <LidoLogo data-testid="lidoLogo" />
    </Link>
  </LogoLidoStyle>
);
