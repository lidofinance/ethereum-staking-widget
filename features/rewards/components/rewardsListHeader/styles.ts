import styled from 'styled-components';

export const RewardsListHeaderStyle = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px 32px;
  height: 32px;
  align-items: center;

  color: ${({ theme }) => theme.colors.secondary};

  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: column;
    height: auto;
    align-items: initial;
  }
`;

export const TitleStyle = styled.span`
  font-weight: bold;
  line-height: 24px;
  font-size: 14px;
`;

export const LeftOptionsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-right: auto;
  gap: 16px;
  ${({ theme }) => theme.mediaQueries.lg} {
    order: 3;
    margin-right: 0;
    width: 100%;
    & > * {
      flex: 1 0;
    }
  }
`;

export const RightOptionsWrapper = styled.div`
  display: flex;
  gap: 10px;
  ${({ theme }) => theme.mediaQueries.lg} {
    order: 2;
    width: 100%;
    & > * {
      flex: 1 0;
      max-width: 50%;
    }
  }
`;
