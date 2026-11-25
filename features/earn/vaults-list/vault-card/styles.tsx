import styled, { css } from 'styled-components';
import {
  Badge,
  Card,
  DataList,
  StatItem,
  downQuery,
} from '@lidofinance/lido-app-ui';

export type VaultCardVariant = 'eth' | 'usd' | 'default';

// ring colours of the vault glow, from the Figma ellipses
const GLOW_COLORS: Record<VaultCardVariant, string | null> = {
  eth: '201, 172, 255',
  usd: '53, 128, 210',
  default: null,
};

const ICON_SIZE = 200;
const ICON_SIZE_MOBILE = 144;
// the rings scale with the icon: 500, 313 and 210 px around a 200 px icon
const RING_RATIOS = [2.5, 1.5657, 1.048] as const;

// the gradient centre sits at the top right of each ring, as in Figma
const ringGradient = (rgb: string, ringSize: number, radiusRatio: number) =>
  `radial-gradient(circle ${Math.round(ringSize * radiusRatio)}px at 85.36% 14.64%, rgba(${rgb}, 1), rgba(${rgb}, 0))`;

const glowRings = (variant: VaultCardVariant, iconSize: number) => {
  const rgb = GLOW_COLORS[variant];
  if (!rgb) return null;

  const [outer, middle, core] = RING_RATIOS.map((ratio) => iconSize * ratio);

  return css`
    &::before,
    &::after,
    & > [data-glow-core] {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
    }

    &::before {
      width: ${outer}px;
      height: ${outer}px;
      background: ${ringGradient(rgb, outer, 0.7726)};
    }

    &::after {
      width: ${middle}px;
      height: ${middle}px;
      background: ${ringGradient(rgb, middle, 0.8415)};
      opacity: 0.9;
    }

    // a soft spot in the surface colour, so the icon stands out in both themes
    & > [data-glow-core] {
      width: ${core}px;
      height: ${core}px;
      background: var(--lido-app-ui-color-background-surface);
      filter: blur(34px);
      opacity: 0.9;
    }
  `;
};

export const CardRoot = styled(Card)`
  && {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    border-radius: 40px;
  }
`;

export const CardOverlayLink = styled.a`
  && {
    position: absolute;
    inset: 0;
    z-index: 1;
  }
`;

// the Card has no padding; the body sets it, so the mobile visual can span the full width
export const CardBody = styled.div`
  display: flex;
  gap: var(--lido-app-ui-space-32);
  width: 100%;
  padding: var(--lido-app-ui-space-32);
  box-sizing: border-box;

  @media ${downQuery('sm')} {
    flex-direction: column-reverse;
    gap: 0;
    padding: 0;
  }
`;

export const CardContent = styled.div`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: var(--lido-app-ui-space-32);
  min-width: 0;

  @media ${downQuery('sm')} {
    gap: var(--lido-app-ui-space-24);
    padding: var(--lido-app-ui-space-20);
  }
`;

export const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-8);
`;

export const CardTitle = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--lido-app-ui-space-8) var(--lido-app-ui-space-20);

  @media ${downQuery('sm')} {
    column-gap: var(--lido-app-ui-space-12);
  }
`;

// the title is h1 in the desktop frames and h2 in the mobile frame
export const CardTitleText = styled.h2`
  margin: 0;
  font-size: var(--lido-app-ui-font-size-h1);
  font-weight: var(--lido-app-ui-font-weight-regular);
  line-height: var(--lido-app-ui-line-height-h1);
  letter-spacing: var(--lido-app-ui-letter-spacing-h1);

  @media ${downQuery('sm')} {
    font-size: var(--lido-app-ui-font-size-h2);
    line-height: var(--lido-app-ui-line-height-h2);
    letter-spacing: var(--lido-app-ui-letter-spacing-h2);
  }
`;

// sits over the overlay link, so its tooltip opens on hover
export const Interactive = styled.span`
  position: relative;
  z-index: 2;
  display: inline-flex;
`;

// the library Badge has no tone, the design uses the info colours
export const ProtectedBadge = styled(Badge)`
  && {
    gap: 0;
    padding: 6px 8px;
    border-color: var(--lido-app-ui-color-border-info);
    background-color: var(--lido-app-ui-color-tint-info);
    color: var(--lido-app-ui-color-text-info);
  }

  && > span:first-child {
    align-items: center;
    justify-content: center;
    color: var(--lido-app-ui-color-text-info);
  }

  && > span:first-child svg {
    width: 20px;
    height: 20px;
  }

  && > span:last-child {
    padding: 0 6px;
  }
`;

// over the overlay link; clicks on empty space still reach the link
const aboveOverlay = `
  position: relative;
  z-index: 2;
  pointer-events: none;

  & a,
  & button,
  & [tabindex] {
    pointer-events: auto;
  }
`;

export const CardStats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--lido-app-ui-space-16) var(--lido-app-ui-space-32);
  ${aboveOverlay}
`;

export const CardStatItem = styled(StatItem)`
  && {
    flex: 0 1 auto;
    gap: 0;
  }
`;

export const CardDataList = styled(DataList)`
  && {
    gap: var(--lido-app-ui-space-8);
    ${aboveOverlay}
  }
`;

// keeps the stale APY tooltip trigger above the overlay link
export const StatValueTrigger = styled(Interactive)`
  display: block;
`;

// the button shows its own hover state
export const CardCta = styled.div`
  ${aboveOverlay}

  @media ${downQuery('sm')} {
    & a,
    & button {
      width: 100%;
    }
  }
`;

export const CardWarning = styled.div`
  ${aboveOverlay}

  // the warning element often renders nothing; then skip the extra gap
  &:empty {
    display: none;
  }
`;

export const VaultVisual = styled.div<{ $variant: VaultCardVariant }>`
  position: relative;
  flex: 0 0 ${ICON_SIZE}px;
  align-self: stretch;
  display: grid;
  place-items: center;
  min-height: ${ICON_SIZE}px;
  z-index: -1;

  ${({ $variant }) => glowRings($variant, ICON_SIZE)}

  & > svg {
    position: relative;
    width: ${ICON_SIZE}px;
    height: ${ICON_SIZE}px;
  }

  @media ${downQuery('sm')} {
    flex-basis: auto;
    height: ${ICON_SIZE_MOBILE}px;
    min-height: 0;

    ${({ $variant }) => glowRings($variant, ICON_SIZE_MOBILE)}

    & > svg {
      width: ${ICON_SIZE_MOBILE}px;
      height: ${ICON_SIZE_MOBILE}px;
    }
  }
`;

// stands in for CardCta; the card gap gives the top space
export const VaultCardGeoNoticeWrapper = styled.div`
  position: relative;
  z-index: 2;
  pointer-events: none;

  & a,
  & button {
    pointer-events: auto;
  }
`;
