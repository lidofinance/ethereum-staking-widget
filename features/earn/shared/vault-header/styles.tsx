import styled from 'styled-components';

export const VaultCardWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

export const VaultHeaderColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.xs}px;
`;

export const VaultHeaderTitle = styled.div`
  color: var(--lido-color-text);
  font-size: ${({ theme }) => theme.fontSizesMap.lg}px;
  font-weight: 700;
  font-size: 26px;
  line-height: 1.4;
`;
