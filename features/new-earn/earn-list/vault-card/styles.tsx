import styled from 'styled-components';
import { Block } from '@lidofinance/lido-ui';

export const CardWrapper = styled(Block)<{ $variant: 'eth' | 'usd' }>`
  position: relative;
  overflow: hidden;
  color: var(--lido-color-text);

  &::before {
    content: '';
    position: absolute;
    top: -90px;
    right: -90px;
    width: 240px;
    height: 240px;
    border-radius: 50%;
    opacity: 0.5;
    filter: blur(10px);
    background: ${({ $variant }) =>
      $variant === 'eth'
        ? 'radial-gradient(closest-side, rgba(184, 146, 255, 0.9), rgba(255, 255, 255, 0))'
        : 'radial-gradient(closest-side, rgba(116, 170, 255, 0.9), rgba(255, 255, 255, 0))'};
    pointer-events: none;
  }

  & > * {
    position: relative;
    z-index: 1;
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spaceMap.md}px;

  ${({ theme }) => theme.mediaQueries.sm} {
    flex-direction: column-reverse;
    align-items: flex-start;
  }
`;

export const CardHeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.xs}px;
`;

export const CardTitle = styled.div`
  font-size: 26px;
  line-height: 38px;
  font-weight: 700;
`;

export const CardDescription = styled.p`
  color: var(--lido-color-textSecondary);
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
`;

export const VaultIconWrapper = styled.div`
  flex-shrink: 0;
  width: 114px;
  height: 114px;
  display: grid;
  place-items: center;

  ${({ theme }) => theme.mediaQueries.sm} {
    width: 64px;
    height: 64px;
  }
`;

export const CardDivider = styled.div`
  height: 1px;
  margin: ${({ theme }) => theme.spaceMap.md}px 0;
  background: ${({ theme }) => theme.colors.border};
`;

export const CardStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spaceMap.lg}px;

  ${({ theme }) => theme.mediaQueries.md} {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spaceMap.md}px;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    gap: ${({ theme }) => theme.spaceMap.sm}px;
  }
`;

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  ${({ theme }) => theme.mediaQueries.sm} {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: ${({ theme }) => theme.spaceMap.sm}px;
  }
`;

export const StatLabel = styled.span`
  color: var(--lido-color-textSecondary);
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  & > svg {
    width: 24px;
    height: 24px;
  }
`;

export const StatValue = styled.span<{ $accent?: boolean; $muted?: boolean }>`
  font-size: ${({ theme }) => theme.fontSizesMap.lg}px;
  font-weight: 700;
  color: ${({ $accent, $muted }) =>
    $muted
      ? 'var(--lido-color-textSecondary)'
      : $accent
        ? 'var(--lido-color-success)'
        : 'var(--lido-color-text)'};
`;

export const CardCta = styled.div`
  margin-top: 32px;
`;
