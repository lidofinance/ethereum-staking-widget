import styled from 'styled-components';

export const VaultReceiveValue = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  font-size: 12px;
  line-height: 20px;
`;

export const VaultReceiveMainValue = styled.span`
  font-weight: 700;

  color: var(--lido-color-text);

  display: flex;
  align-items: center;
  gap: 4px;

  & > svg {
    width: 16px;
    height: 16px;
  }
`;

export const VaultReceiveSecondaryValue = styled.span`
  color: var(--text-color-text-secondary, #7a8aa0);
  font-weight: 400;
`;
