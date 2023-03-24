import styled from 'styled-components';

export const RequestsInfoStyled = styled.div`
  background-color: var(--lido-color-backgroundSecondary);
  padding: ${({ theme }) => theme.spaceMap.lg}px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
`;

export const RequestsInfoDescStyled = styled.div`
  font-size: 12px;
  line-height: 20px;
`;

export const RequestsInfoItemsStyled = styled.div`
  font-size: 12px;
  line-height: 20px;
  margin-top: ${({ theme }) => theme.spaceMap.md}px;
  max-height: 52px;
  overflow-y: scroll;
`;

export const RequestEthAmountStyled = styled.div`
  margin-left: auto;
  color: var(--lido-colo-text);
`;

export const RequestStyled = styled.div`
  display: flex;
  margin-top: 12px;

  &:first-of-type {
    margin-top: 0;
  }
`;
