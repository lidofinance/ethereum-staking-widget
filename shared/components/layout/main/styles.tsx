import { Container, ContainerProps } from '@lidofinance/lido-ui';
import styled from 'styled-components';

export const MainStyle = styled(Container)<ContainerProps>`
  position: relative;
  margin-top: ${({ theme }) => theme.spaceMap.sm}px;
  margin-bottom: ${({ theme }) => theme.spaceMap.sm}px;
`;
