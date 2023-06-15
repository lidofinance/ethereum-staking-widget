import styled from 'styled-components';
import { Text } from '@lidofinance/lido-ui';

export const Wrap = styled.div`
  text-align: center;
`;

export const Title = styled(Text).attrs({
  size: 'sm',
})`
  margin-top: ${({ theme }) => theme.spaceMap.xl}px;
  font-weight: 800;
  text-align: center;
`;

export const Description = styled(Text).attrs({
  size: 'xs',
  color: 'secondary',
})`
  margin-top: ${({ theme }) => theme.spaceMap.xs}px;
  text-align: center;
`;

export const Footer = styled.div`
  margin-top: ${({ theme }) => theme.spaceMap.xxl}px;
`;

export const FooterHint = styled(Text).attrs({
  size: 'xxs',
  color: 'secondary',
})`
  text-align: center;
  margin-top: ${({ theme }) => theme.spaceMap.xxl}px;
`;
