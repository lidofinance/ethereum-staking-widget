import { FC, PropsWithChildren } from 'react';

import { ContainerStyled } from './styles';

export const VaultPageContent: FC<PropsWithChildren> = ({ children }) => {
  return <ContainerStyled>{children}</ContainerStyled>;
};
