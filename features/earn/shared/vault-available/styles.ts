import styled from 'styled-components';

export const VaultAvailableContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  margin-bottom: ${({ theme }) => theme.spaceMap.xs}px;

  font-size: 14px;
  font-weight: 700;
  line-height: 24px;

  color: var(--lido-color-text);
`;

export const VaultAvailableLabel = styled.span`
  font-weight: 400;
  color: var(--lido-color-textSecondary);
`;
