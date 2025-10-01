import styled from 'styled-components';

export const NotificationContainer = styled.div`
  margin-top: 20px;
  padding: 12px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  line-height: 24px;
  text-align: left;
  color: var(--lido-color-accentText);
`;

export const NotificationTitle = styled.div`
  font-weight: bold;
`;

export const NotificationList = styled.ol`
  padding-left: ${({ theme }) => theme.spaceMap.md}px;
`;
