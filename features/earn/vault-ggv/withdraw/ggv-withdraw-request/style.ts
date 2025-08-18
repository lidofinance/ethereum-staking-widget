import styled from 'styled-components';

export const RequestsContainer = styled.div`
  display: flex;
  flex-direction: column;

  padding: ${({ theme }) => theme.spaceMap.md}px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  gap: 12px;
  background-color: ${({ theme }) =>
    theme.name === 'light' ? `#F6F7F8` : 'var(--lido-color-controlBg)'};
`;

export const RequestSectionTitle = styled.h3`
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: 20px;

  color: var(--lido-color-text);
`;

export const RequestEntryContainer = styled.div`
  display: grid;
  grid-template-rows: 24px 20px;
  grid-template-columns: 32px max-content auto;
  gap: 0px 12px;

  font-size: 14px;
`;

export const RequestIcon = styled.div`
  align-self: center;
  grid-row: 1 / span 2;
  grid-column: 1;
`;

export const RequestMainBalance = styled.div`
  grid-row: 1;
  grid-column: 2;

  font-weight: 700;
  line-height: 24px;
  color: var(--lido-color-text);
`;

export const RequestSubBalance = styled.div`
  grid-row: 2;
  grid-column: 2;

  font-size: 12px;
  line-height: 20px;
  color: var(--lido-color-textSecondary);
`;

export const RequestInfo = styled.div`
  grid-row: 1 / span 2;
  grid-column: 3;
  align-self: center;

  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

export const ButtonText = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  margin-left: 12px;
  font: inherit;
  color: inherit;
  cursor: pointer;

  color: var(--lido-color-primary);

  &:active {
    color: var(--lido-color-primary);
  }

  &:hover,
  &:active {
    color: var(--lido-color-primaryHover);
  }

  &:disabled {
    color: var(--lido-color-textDisabled);
    cursor: not-allowed;
  }
`;
