import styled from 'styled-components';
import { Drawer } from '@lidofinance/lido-app-ui';

export const DRAWER_WIDTH = 500;

// the library drawer; a bottom sheet from 600px down
export const DrawerRightPanel = styled(Drawer)`
  &:focus {
    outline: none;
  }
`;

export const DrawerRightContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-32);
  padding-bottom: var(--lido-app-ui-space-8);
  color: var(--lido-app-ui-color-text-secondary);
`;

export const DrawerRightFooter = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-12);
`;
