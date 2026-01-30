import styled from 'styled-components';
import { Block, Button } from '@lidofinance/lido-ui';

export const UpgradeCardBlock = styled(Block)`
  background: linear-gradient(135deg, #f5f3ff 0%, #fef1f6 100%);
  border: 1px solid rgba(201, 172, 255, 0.7);
  color: var(--lido-color-text);
  max-width: 680px;
`;

export const UpgradeContent = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 214px;
  gap: 32px;
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  line-height: 24px;

  ${({ theme }) => theme.mediaQueries.md} {
    grid-template-columns: 1fr;

`;

export const UpgradeColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
  width: 100%;
`;

export const UpgradeTitle = styled.h3`
  font-size: 26px;
  font-weight: 700;
  line-height: 38px;
`;

export const UpgradeList = styled.div`
  display: grid;
  gap: 12px;
  margin-top: 16px;
`;

export const UpgradeItem = styled.div`
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
`;

export const UpgradeItemIcon = styled.span`
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  color: var(--lido-color-text);
`;

export const UpgradeParagraph = styled.p`
  margin-top: 16px;
`;

export const UpgradeIllustrationSlot = styled.div`
  display: grid;
  place-items: center;

  ${({ theme }) => theme.mediaQueries.md} {
    display: none;
  }
`;

export const UpgradeButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spaceMap.xl}px;
`;
