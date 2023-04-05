import { Text } from '@lidofinance/lido-ui';
import styled from 'styled-components';

export const BoldText = styled(Text)`
  text-align: center;
  margin-top: 24px;
  font-weight: 800;
`;

export const TextWrapper = styled.div`
  text-align: center;
`;

export const MiddleDescription = styled(Text)`
  margin-top: 8px;
  line-height: 24px;
`;

export const BottomDescription = styled(Text)`
  margin-top: 44px;
  line-height: 20px;

  & a {
    text-decoration: none;
  }
`;

export const BottomButtons = styled.div`
  margin-top: 44px;
  line-height: 20px;
  display: flex;
  justify-content: space-between;

  button:first-of-type {
    margin-right: ${({ theme }) => theme.spaceMap.lg}px;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    display: flex;
    flex-direction: column;

    button:first-of-type {
      margin-right: 0;
      margin-bottom: ${({ theme }) => theme.spaceMap.lg}px;
    }
  }
`;

export const RetryButtonStyled = styled.span`
  cursor: pointer;
  color: var(--lido-color-primary);
`;
