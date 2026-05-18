import { ButtonInline } from 'shared/components/button-inline/button-inline';
import styled, { css } from 'styled-components';
import { Block, Button } from '@lidofinance/lido-ui';

export const UpgradeAssets = styled(Block)`
  ${({ theme }) =>
    theme.name === 'light'
      ? css`
          background: linear-gradient(135deg, #f5f3ff 0%, #fef1f6 100%);
        `
      : css`
          background: linear-gradient(
              87.27deg,
              rgba(201, 172, 255, 0.2) -11.77%,
              rgba(255, 206, 190, 0.2) 102.78%
            ),
            #27272e;
        `}
  display: grid;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
  border: 1px solid #c9acff;
  padding: ${({ theme }) => theme.spaceMap.lg}px;
  color: var(--lido-color-text);
`;

export const UpgradeAssetsHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spaceMap.md}px;
  margin: 0 0 ${({ theme }) => theme.spaceMap.sm}px;
`;

export const UpgradeAssetsTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  font-weight: 700;
  margin: 0;
`;

export const UpgradeAssetsHowItWorksButton = styled(ButtonInline)`
  font-weight: 700;
`;

export const UpgradeAssetsAmount = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
`;

export const UpgradeAssetsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
`;

export const UpgradeAssetsTokenIcon = styled.span`
  display: flex;
  align-items: center;
  flex-shrink: 0;

  svg {
    width: 26px;
    height: 26px;
  }
`;

export const UpgradeAssetsButton = styled(Button)``;
