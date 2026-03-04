import { Tabs } from '@lidofinance/lido-ui';
import styled from 'styled-components';
import { LocalLink } from 'shared/components/local-link';

export const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr minmax(358px, 396px);
  column-gap: 100px;
  row-gap: ${({ theme }) => theme.spaceMap.xl}px;
  margin: ${({ theme }) => theme.spaceMap.lg}px 0;

  ${({ theme }) => theme.mediaQueries.xl} {
    grid-template-columns: 1fr;
  }
`;

export const Description = styled.p`
  color: var(--lido-color-textSecondary);
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  line-height: 1.6;
  margin: 0;
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
  padding-top: ${({ theme }) => theme.spaceMap.xxl}px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-weight: 400;
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
  font-weight: 400;
`;

export const Metrics = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
  padding-bottom: ${({ theme }) => theme.spaceMap.xxl}px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const Table = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spaceMap.lg}px;
  font-weight: 400;

  ${({ theme }) => theme.mediaQueries.md} {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spaceMap.sm}px;
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
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spaceMap.xs}px;
  text-align: right;

  a {
    color: var(--lido-color-text);
  }
`;

export const TableLink = styled(LocalLink)`
  color: var(--lido-color-primary);
`;

export const TabsStyled = styled(Tabs)`
  & * {
    font-family: inherit;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    span {
      font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
      line-height: 24px;
    }
  }
`;
