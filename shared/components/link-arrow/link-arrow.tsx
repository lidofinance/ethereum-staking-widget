import { ComponentProps } from 'react';
import styled from 'styled-components';
import { Link, ArrowBack } from '@lidofinance/lido-ui';

export const LinkWrap = styled(Link)`
  display: flex;
  align-items: center;
  width: fit-content;

  &:hover svg {
    transform: rotate(180deg) translateX(-2px);
  }
`;

export const Arrow = styled(ArrowBack)`
  display: block;
  margin-left: 3px;
  width: 16px;
  height: 16px;
  transform: rotate(180deg);
  transition: transform ${({ theme }) => theme.ease.outCubic}
    ${({ theme }) => theme.duration.med};
`;

export const LinkArrow = ({
  children,
  ...props
}: ComponentProps<typeof LinkWrap>) => {
  return (
    <LinkWrap {...props}>
      {children} <Arrow />
    </LinkWrap>
  );
};
