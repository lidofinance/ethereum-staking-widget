import { FC, PropsWithChildren } from 'react';

import { LeftColumnStyled } from './styles';

export const LeftColumn: FC<PropsWithChildren> = ({ children }) => {
  return <LeftColumnStyled>{children}</LeftColumnStyled>;
};
