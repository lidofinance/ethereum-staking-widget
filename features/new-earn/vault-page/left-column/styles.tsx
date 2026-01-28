import styled from 'styled-components';

export const LeftColumnStyled = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.xl}px;
`;

export const TopSectionStyled = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.md}px;
`;

export const TopSectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.xl}px;
`;

export const TopSectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spaceMap.md}px;
`;

export const TopSectionHeaderTitle = styled.h1`
  font-size: 36px;
  font-weight: 700;
  line-height: 50px;
`;

export const TopSectionHeaderIcon = styled.span`
  width: 64px;
  height: 64px;
  display: inline-flex;
  flex-shrink: 0;
  overflow: visible;

  & > svg {
    width: 100%;
    height: 100%;
    display: block;
    overflow: visible;
  }
`;

export const TopSectionDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  font-weight: 400;
  line-height: 24px;
  color: var(--lido-color-text);
`;

export const TopSectionStatsRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spaceMap.md}px;
  max-width: 300px;
`;

export const TopSectionStatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  &:first-child {
    flex: 1;
  }
`;

export const TopSectionStatLabel = styled.span`
  color: var(--lido-color-textSecondary);
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  font-weight: 400;
  line-height: 24px;
`;

export const TopSectionStatValue = styled.span<{ $accent?: boolean }>`
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizesMap.lg}px;
  line-height: 28px;
  color: ${({ $accent }) =>
    $accent ? 'var(--lido-color-success)' : 'var(--lido-color-text)'};
`;
