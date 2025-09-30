import styled from 'styled-components';

export const RequestsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: ${({ theme }) =>
    theme.name === 'light' ? `#F6F7F8` : 'var(--lido-color-controlBg)'};
  padding: ${({ theme }) => theme.spaceMap.md}px;
  margin-bottom: ${({ theme }) => theme.spaceMap.lg}px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;

  ${({ theme }) => theme.mediaQueries.md} {
    padding: 12px;
  }
`;

export const ActionableTitle = styled.div`
  display: flex;
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  line-height: 20px;
  letter-spacing: 0px;
  vertical-align: middle;
  color: var(--lido-color-text);
  margin-top: 0px;

  &:not(:first-child) {
    margin-top: ${({ theme }) => theme.spaceMap.sm}px;
  }

  button {
    margin-left: auto;
  }
`;

export const RequestContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.lg}px;
`;

export const Entry = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const TokenLogo = styled.div``;

export const AmountContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

export const AmountTokenValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizesMap.sm}px;
  font-weight: 700;
  font-style: Bold;
  line-height: 24px;
  letter-spacing: 0px;
  color: var(--lido-color-text);
`;

export const AmountUSD = styled.span`
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: 0px;
`;

export const CreatedDate = styled.span`
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: 0px;
`;
