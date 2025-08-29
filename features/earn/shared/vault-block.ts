import styled from 'styled-components';
import { Block } from '@lidofinance/lido-ui';

export const VaultBlock = styled(Block)`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spaceMap.xl}px;
  gap: ${({ theme }) => theme.spaceMap.xl}px;

  ${({ theme }) => theme.mediaQueries.md} {
    padding: ${({ theme }) => theme.spaceMap.lg}px;
    gap: ${({ theme }) => theme.spaceMap.lg}px;
  }
`;

export const VaultBlockHeaderSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.md}px;

  ${({ theme }) => theme.mediaQueries.md} {
    gap: 12px;
    margin-bottom: ${({ theme }) => theme.spaceMap.xs}px;
  }
`;

export const VaultBlockFormSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
