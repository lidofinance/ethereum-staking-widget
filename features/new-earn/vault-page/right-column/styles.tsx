import styled from 'styled-components';
import { Block, Button } from '@lidofinance/lido-ui';

export const RightColumnStyled = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.md}px;
  min-width: 358px;
  max-width: 396px;
  width: 100%;
`;

export const UpgradeAssets = styled(Block)`
  display: grid;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
  border: 1px solid rgba(201, 172, 255, 0.7);
  background: linear-gradient(135deg, #f5f3ff 0%, #fef1f6 100%);
  padding: ${({ theme }) => theme.spaceMap.lg}px;
`;

export const UpgradeAssetsText = styled.div`
  h4 {
    font-size: ${({ theme }) => theme.fontSizesMap.sm}px;
    font-weight: 700;
    margin: 0;
  }

  p {
    color: var(--lido-color-textSecondary);
    font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
    margin: 0;
  }
`;

export const UpgradeAssetsAmount = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
`;

export const UpgradeAssetsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
`;

export const UpgradeAssetsIcon = styled.span`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #f6d37a;
  border: 1px solid #f0b549;
`;

export const UpgradeAssetsButton = styled(Button)`
  justify-self: start;
  padding: 6px 14px;
`;
