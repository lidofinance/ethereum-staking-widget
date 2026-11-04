import { Container } from '@lidofinance/lido-ui';
import styled from 'styled-components';

export const HeaderStyled = styled(Container)`
  position: relative;

  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spaceMap.sm}px;

  height: 76px;
  padding: ${({ theme }) => theme.spaceMap.md}px 40px;

  ${({ theme }) => theme.mediaQueries.lg} {
    height: 80px;
    padding: 18px ${({ theme }) => theme.spaceMap.lg}px;
  }
`;
