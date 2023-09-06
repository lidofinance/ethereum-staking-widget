import styled from 'styled-components';

export const ButtonLinkWrap = styled.a`
  display: block;
`;

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
