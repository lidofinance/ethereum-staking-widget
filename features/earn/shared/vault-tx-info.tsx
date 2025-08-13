import styled from 'styled-components';

export const VaultTxInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
  margin: 12px 0;
`;
