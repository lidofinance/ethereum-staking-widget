import { ComponentType, FC, PropsWithChildren, SVGProps } from 'react';

import { TopSection } from './top-section';
import { ContainerStyled } from './styles';

type VaultIllustration = ComponentType<SVGProps<SVGSVGElement>>;
type VaultPageContentProps = {
  logo: VaultIllustration;
  title: string;
  description: string;
  apy: string;
  tvl: string;
};

export const VaultPageContent: FC<PropsWithChildren<VaultPageContentProps>> = ({
  children,
  ...props
}) => {
  return (
    <ContainerStyled>
      <TopSection {...props} />
      {children}
    </ContainerStyled>
  );
};
