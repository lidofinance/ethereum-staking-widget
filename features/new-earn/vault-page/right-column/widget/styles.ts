import styled from 'styled-components';
import { Block } from '@lidofinance/lido-ui';

export const SidebarCard = styled(Block)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.md}px;
  padding: ${({ theme }) => theme.spaceMap.lg}px;
  width: 100%;
`;

// TODO: change to tabs component
export const VaultActionTabs = styled.div`
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  border-radius: 999px;
  background: #e9edf2;
`;

export const VaultForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.md}px;
`;

export const InfoBox = styled.div`
  background: #f5f6f8;
  border-radius: 12px;
  padding: ${({ theme }) => theme.spaceMap.md}px;
  color: var(--lido-color-textSecondary);
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  line-height: 1.6;
`;

export const InfoBoxTitle = styled.p`
  margin: 0 0 6px;
`;

export const InfoBoxList = styled.ul`
  padding-left: 18px;
  display: grid;
  gap: 6px;
  margin: 0;
`;
