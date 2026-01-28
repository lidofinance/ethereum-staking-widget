import styled from 'styled-components';
import { LocalLink } from 'shared/components/local-link';

export const Layout = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spaceMap.lg}px;
  margin: ${({ theme }) => theme.spaceMap.lg}px 0;

  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: column;
  }
`;

export const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.md}px;
  min-width: 358px;
  max-width: 396px;
  width: 100%;
`;

export const Description = styled.p`
  color: var(--lido-color-textSecondary);
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  line-height: 1.6;
  margin: 0;
`;

export const ActionTabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: ${({ theme }) => theme.spaceMap.xs}px;
  max-width: 520px;
`;

export const ActionTab = styled.button<{ $active?: boolean }>`
  border: none;
  background: none;
  font: inherit;
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  color: ${({ $active }) =>
    $active ? 'var(--lido-color-text)' : 'var(--lido-color-textSecondary)'};
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  padding: ${({ theme }) => theme.spaceMap.xs}px 0;
  border-bottom: ${({ $active }) =>
    $active ? '2px solid var(--lido-color-primary)' : '2px solid transparent'};
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
`;

export const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizesMap.sm}px;
  font-weight: 700;
  margin: 0;
`;

export const RiskSection = styled(Section)`
  padding-top: ${({ theme }) => theme.spaceMap.lg}px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
`;

export const InfoRowLabel = styled.span`
  color: var(--lido-color-textSecondary);
`;

export const InfoRowValue = styled.span`
  font-weight: 600;
`;

export const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spaceMap.md}px;
  padding-bottom: ${({ theme }) => theme.spaceMap.md}px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const Table = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spaceMap.lg}px;

  ${({ theme }) => theme.mediaQueries.md} {
    grid-template-columns: 1fr;
  }
`;

export const TableDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spaceMap.lg}px 0;
`;

export const TableGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
`;

export const TableItem = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
`;

export const TableLabel = styled.span`
  color: var(--lido-color-textSecondary);
`;

export const TableValue = styled.span`
  font-weight: 600;
  text-align: right;
`;

export const TableLink = styled(LocalLink)`
  color: var(--lido-color-primary);
`;
