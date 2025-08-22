import styled from 'styled-components';
import { Block } from '@lidofinance/lido-ui';

export const VaultBlock = styled(Block)`
  padding: ${({ theme }) => theme.spaceMap.xl}px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.xl}px;
`;

export const VaultBlockHeaderSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.md}px;
`;

export const VaultBlockFormSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
