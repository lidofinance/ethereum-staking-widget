import styled from 'styled-components';

export const VaultReceiveContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;

  font-weight: 400;
  color: var(--lido-color-textSecondary);
  font-size: 12px;
  line-height: 20px;
`;

export const VaultReceiveValue = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
`;

export const VaultReceiveMainValue = styled.span`
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: 20px;
  color: var(--lido-color-text);

  display: flex;
  align-items: center;
  gap: 4px;

  & > svg {
    width: 16px;
    height: 16px;
  }
`;
