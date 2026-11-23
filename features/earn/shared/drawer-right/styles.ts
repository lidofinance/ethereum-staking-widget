import styled from 'styled-components';
import { Drawer } from '@lidofinance/lido-app-ui';

export const DRAWER_WIDTH = 600;

// the library drawer; a bottom sheet from 600px down
export const DrawerRightPanel = styled(Drawer)`
  // doubled class: Earn keeps its own font and colours inside the library panel
  && {
    background-color: var(--lido-color-foreground);
    color: var(--lido-color-text);
    font-family: inherit;
  }

  &:focus {
    outline: none;
  }
`;

export const DrawerRightTitle = styled.span`
  color: var(--lido-color-text);
  font-family: inherit;
  font-size: ${({ theme }) => theme.fontSizesMap.lg}px;
  font-weight: 700;
  line-height: 28px;
  letter-spacing: normal;
`;

export const DrawerRightContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.xl}px;
`;

export const DrawerDescription = styled.div`
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  font-weight: 400;
  line-height: 24px;
`;

export const DrawerRightFooter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const DrawerRightText = styled.div`
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  font-weight: 400;
  line-height: 24px;
  color: var(--lido-color-textSecondary);
`;
