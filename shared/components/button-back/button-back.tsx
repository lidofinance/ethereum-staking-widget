import { FC, PropsWithChildren } from 'react';
import { ChevronLeftStyled, LocalLinkStyled } from './styles';

export const ButtonBack: FC<PropsWithChildren<{ url: string }>> = ({
  url,
  children,
}) => {
  return (
    <LocalLinkStyled href={url}>
      <ChevronLeftStyled />
      {children}
    </LocalLinkStyled>
  );
};
