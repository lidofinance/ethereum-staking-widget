import { ComponentType, FC, PropsWithChildren, SVGProps } from 'react';

import { TopSection } from './top-section';
import { Chart } from './chart';
import { LeftColumnStyled } from './styles';

type VaultIllustration = ComponentType<SVGProps<SVGSVGElement>>;
type LeftColumnProps = {
  illustration: VaultIllustration;
  title: string;
  description: string;
  apy: string;
  tvl: string;
};

export const LeftColumn: FC<PropsWithChildren<LeftColumnProps>> = ({
  children,
  ...props
}) => {
  return (
    <LeftColumnStyled>
      <TopSection {...props} />
      <Chart />
      {children}
    </LeftColumnStyled>
  );
};
