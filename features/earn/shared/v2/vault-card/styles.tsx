import styled from 'styled-components';
import { Block, Badge, Tooltip } from '@lidofinance/lido-ui';
import { ReactComponent as ChevronsUp } from 'assets/icons/chevrons-up.svg';

const getBackgroundGradient = (variant: 'eth' | 'usd' | 'default'): string => {
  const gradients: Record<'eth' | 'usd' | 'default', string> = {
    eth: 'radial-gradient(closest-side, rgba(184, 146, 255, 0.9), rgba(255, 255, 255, 0))',
    usd: 'radial-gradient(closest-side, rgba(116, 170, 255, 0.9), rgba(255, 255, 255, 0))',
    default: 'none',
  };
  return gradients[variant];
};

export const CardWrapper = styled(Block)<{
  $variant: 'eth' | 'usd' | 'default';
}>`
  position: relative;
  isolation: isolate;
  overflow: hidden;
  color: var(--lido-color-text);
  transition: box-shadow 0.1s ease;
  border: 1px solid
    ${({ theme }) => (theme.name === 'dark' ? '#34343D' : '#fff')};

  &:hover {
    box-shadow: 0px 4px 64px 0px
      ${({ theme }) => (theme.name === 'dark' ? '#000' : '#a7c9eb66')};
  }

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
    background: ${({ $variant }) => getBackgroundGradient($variant)};
    pointer-events: none;
    z-index: -1;

    ${({ theme }) => theme.mediaQueries.md} {
      top: -60px;
      right: 0;
      left: calc(50% - 120px);
    }
  }

  & > * {
    position: relative;
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spaceMap.md}px;

  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: column-reverse;
    align-items: center;
  }
`;

export const CardHeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.xs}px;

  ${({ theme }) => theme.mediaQueries.md} {
    align-items: center;
    text-align: center;
  }
`;

export const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spaceMap.md}px;
  font-size: 26px;
  line-height: 38px;
  font-weight: 700;
  z-index: 1;

  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: ${({ theme }) => theme.spaceMap.xs}px;
  }
`;

export const CardTitleBadge = styled(Badge)`
  height: 32px;
  user-select: none;
  position: relative;
  z-index: 2;
`;

export const ChevronsUpIcon = styled(ChevronsUp)`
  width: 20px;
  height: 20px;
`;

export const CardDescription = styled.p`
  color: var(--lido-color-textSecondary);
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  line-height: 24px;
  font-weight: 400;
`;

export const VaultIconWrapper = styled.div`
  flex-shrink: 0;
  width: 114px;
  height: 114px;
  display: grid;
  place-items: center;

  ${({ theme }) => theme.mediaQueries.md} {
    width: 124px;
    height: 124px;
  }

  position: relative;
  z-index: 0;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 166px;
    height: 166px;

    background: rgba(255, 255, 255, 1);
    border-radius: 50%;
    filter: blur(54px);

    z-index: -1;
    pointer-events: none;

    display: ${({ theme }) => (theme.name === 'light' ? 'block' : 'none')};

    ${({ theme }) => theme.mediaQueries.sm} {
      display: none;
    }
  }
`;

export const CardDivider = styled.div`
  height: 1px;
  margin: ${({ theme }) => theme.spaceMap.xl}px 0;
  background: ${({ theme }) => theme.colors.border};
`;

export const CardStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, auto);
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

  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: ${({ theme }) => theme.spaceMap.sm}px;
  }
`;

export const StatLabel = styled.span`
  color: var(--lido-color-textSecondary);
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  line-height: 24px;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  & > svg {
    width: 24px;
    height: 24px;
  }
`;

export const StatValue = styled.span<{ $accent?: boolean; $muted?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spaceMap.xs}px;
  font-size: ${({ theme }) => theme.fontSizesMap.lg}px;
  font-weight: 700;
  color: ${({ $accent, $muted }) =>
    $muted
      ? 'var(--lido-color-textSecondary)'
      : $accent
        ? 'var(--lido-color-success)'
        : 'var(--lido-color-text)'};

  ${({ theme }) => theme.mediaQueries.md} {
    font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
    line-height: 24px;
  }
`;

export const StatValueIcon = styled.span`
  display: inline-flex;
  flex: 0 0 24px;
  width: 24px;
  height: 24px;
`;

export const CardCta = styled.div`
  margin-top: 32px;
`;

export const StyledTooltip = styled(Tooltip)`
  margin-top: ${({ theme }) => theme.spaceMap.xs}px !important;
`;

export const BadgeStyled = styled.span`
  position: relative;
  z-index: 2;

  ${({ theme }) => theme.mediaQueries.md} {
    order: 1;
  }
`;

export const TitleTextStyled = styled.span`
  ${({ theme }) => theme.mediaQueries.md} {
    order: 2;
  }
`;

export const CardOverlayLink = styled.a`
  && {
    position: absolute;
    inset: 0;
    z-index: 1;
  }
`;

export const VaultWarning = styled.div`
  margin-top: 32px;
  z-index: 2;
`;
