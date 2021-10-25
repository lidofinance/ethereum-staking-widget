import { FC, SVGProps } from 'react';
import { LogoLDOPLStyle, LogoLDOStyle } from './styles';

export type LogoComponent = FC<Omit<SVGProps<SVGSVGElement>, 'ref'>>;

export const LogoLDO: LogoComponent = (props) => {
  return <LogoLDOStyle {...props} />;
};

export const LogoLDOPL: LogoComponent = (props) => {
  return <LogoLDOPLStyle {...props} />;
};
