import styled from 'styled-components';
import { Block } from '@lidofinance/lido-ui';

export const VaultCardWrapper = styled(Block)`
  margin: ${({ theme }) => theme.spaceMap.md}px 0;
`;

export const VaultCardMyPosition = styled.div`
  display: flex;
  margin: ${({ theme }) => theme.spaceMap.md}px 0
    ${({ theme }) => theme.spaceMap.xl}px 0;
  padding-top: ${({ theme }) => theme.spaceMap.md}px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export const VaultCardMyPositionLabel = styled.div`
  color: var(--lido-color-textSecondary);
  margin-right: ${({ theme }) => theme.spaceMap.xs}px;
`;

export const VaultCardMyPositionValue = styled.div`
  font-weight: 700;
`;
