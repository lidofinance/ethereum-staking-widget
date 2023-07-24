import styled from 'styled-components';

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
