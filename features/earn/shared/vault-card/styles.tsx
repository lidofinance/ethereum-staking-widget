import styled from 'styled-components';
import { Block } from '@lidofinance/lido-ui';
import { LocalLink } from 'shared/components/local-link';

export const VaultCardWrapper = styled(Block)`
  margin: ${({ theme }) => theme.spaceMap.md}px 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.md}px;
`;

export const VaultCardMyPosition = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.xs}px;
  padding-top: ${({ theme }) => theme.spaceMap.md}px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
`;

export const VaultCardMyPositionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export const VaultCardMyPositionLabel = styled.div`
  color: var(--lido-color-textSecondary);
  margin-right: 6px;
`;

export const VaultCardMyPositionValue = styled.div`
  font-weight: 700;
  display: flex;
  gap: 4px;

  & > svg {
    width: 16px;
    height: 16px;
  }

  &:not(:last-child) {
    border-right: 1px solid grey;
    padding-right: 12px;
    margin-right: 12px;
  }
`;

export const VaultCardCTALink = styled(LocalLink)`
  margin-top: ${({ theme }) => theme.spaceMap.sm}px;
`;
