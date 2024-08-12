import { Container, ContainerProps } from '@lidofinance/lido-ui';
import styled from 'styled-components';

export const MainStyle = styled(Container)<ContainerProps>`
  position: relative;
  padding-top: ${({ theme }) => theme.spaceMap.sm}px;
  padding-bottom: ${({ theme }) => theme.spaceMap.sm}px;
`;
