import styled from 'styled-components';

export const ContainerStyled = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.xxl}px;

  ${({ theme }) => theme.mediaQueries.xl} {
    order: 3;
  }
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

  ${({ theme }) => theme.mediaQueries.md} {
    font-size: 26px;
    line-height: 38px;
  }
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

  ${({ theme }) => theme.mediaQueries.md} {
    width: 40px;
    height: 40px;
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
`;

export const TopSectionStatItem = styled.div`
  display: flex;
  flex-direction: column;
  flex: 0 0 160px;
  gap: 4px;

  ${({ theme }) => theme.mediaQueries.md} {
    flex: 1 0 auto;
  }
`;

export const TopSectionStatLabel = styled.span`
  display: flex;
  align-items: center;
  color: var(--lido-color-textSecondary);
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  font-weight: 400;
  line-height: 24px;
`;

export const TopSectionStatSubValue = styled.span`
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

  ${({ theme }) => theme.mediaQueries.md} {
    font-size: ${({ theme }) => theme.fontSizesMap.sm}px;
    line-height: 24px;
  }
`;
