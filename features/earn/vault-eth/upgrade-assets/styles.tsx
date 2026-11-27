import styled from 'styled-components';
import { Card } from '@lidofinance/lido-app-ui';

// The design colour for upgrade blocks: the theme has no token for it.
export const UpgradeAssets = styled(Card)`
  && {
    border: 1px solid #c9acff;
  }
`;

export const UpgradeAssetsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--lido-app-ui-space-12);
`;

export const UpgradeAssetsList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-4);
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const UpgradeAssetsRow = styled.li`
  display: flex;
  align-items: center;
  gap: var(--lido-app-ui-space-12);
  padding: var(--lido-app-ui-space-8) 0;
`;

export const UpgradeAssetsAmount = styled.div`
  display: flex;
  flex: 1 1 0;
  align-items: center;
  gap: var(--lido-app-ui-space-8);
  min-width: 0;
`;

export const UpgradeAssetsTokenIcon = styled.span`
  display: flex;
  flex: none;

  & > svg {
    display: block;
    width: 24px;
    height: 24px;
  }
`;
