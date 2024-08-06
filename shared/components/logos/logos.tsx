import { FC, HTMLAttributes, SVGProps } from 'react';
import Link from 'next/link';
import { LidoLogo } from '@lidofinance/lido-ui';

import { config } from 'config';

import { LogoLidoStyle } from './styles';

export type LogoComponent = FC<Omit<SVGProps<SVGSVGElement>, 'ref'>>;

export const LogoLido: FC<HTMLAttributes<HTMLDivElement>> = (props) => (
  <LogoLidoStyle {...props}>
    <Link href={config.rootOrigin}>
      <LidoLogo data-testid="lidoLogo" />
    </Link>
  </LogoLidoStyle>
);
