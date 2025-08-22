import { FC, PropsWithChildren } from 'react';
import { ChevronLeftStyled, LocalLinkStyled } from './styles';

export const ButtonBack: FC<
  PropsWithChildren<{ url: string; onClick?: (e: any) => void }>
> = ({ url, children, onClick }) => {
  return (
    <LocalLinkStyled href={url} onClick={onClick}>
      <ChevronLeftStyled />
      {children}
    </LocalLinkStyled>
  );
};
