import { FC, PropsWithChildren } from 'react';
import { ChevronLeftStyled, LinkStyled } from './styles';

export const ButtonBack: FC<
  PropsWithChildren<{ url: string; onClick?: (e: any) => void }>
> = ({ url, children, onClick }) => {
  return (
    <LinkStyled href={url} onClick={onClick} data-testid="btn-back">
      <ChevronLeftStyled />
      {children}
    </LinkStyled>
  );
};
