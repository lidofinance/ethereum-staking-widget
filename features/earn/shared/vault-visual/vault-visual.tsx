import type { ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { downQuery } from '@lidofinance/lido-app-ui';

export type VaultVisualVariant = 'eth' | 'usd' | 'default';

// ring colours of the vault glow
const GLOW_COLORS: Record<VaultVisualVariant, string | null> = {
  eth: '201, 172, 255',
  usd: '53, 128, 210',
  default: null,
};

// the rings scale with the icon, e.g. 420, 263 and 176 px around a 168 px icon
const RING_RATIOS = [2.5, 1.5657, 1.048] as const;

// the gradient centre sits at the top right of each ring
const ringGradient = (rgb: string, ringSize: number, radiusRatio: number) =>
  `radial-gradient(circle ${Math.round(ringSize * radiusRatio)}px at 85.36% 14.64%, rgba(${rgb}, 1), rgba(${rgb}, 0))`;

const glowRings = (variant: VaultVisualVariant, iconSize: number) => {
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

type VisualRootProps = {
  $variant: VaultVisualVariant;
  $iconSize: number;
  $iconSizeMobile: number;
};

// The parent sets the box size and clips the rings (overflow: hidden on the card).
const VisualRoot = styled.div<VisualRootProps>`
  position: relative;
  display: grid;
  place-items: center;
  z-index: 0;

  ${({ $variant, $iconSize }) => glowRings($variant, $iconSize)}

  & > svg {
    position: relative;
    width: ${({ $iconSize }) => $iconSize}px;
    height: ${({ $iconSize }) => $iconSize}px;
  }

  @media ${downQuery('sm')} {
    ${({ $variant, $iconSizeMobile }) => glowRings($variant, $iconSizeMobile)}

    & > svg {
      width: ${({ $iconSizeMobile }) => $iconSizeMobile}px;
      height: ${({ $iconSizeMobile }) => $iconSizeMobile}px;
    }
  }
`;

type VaultVisualProps = {
  variant: VaultVisualVariant;
  iconSize: number;
  iconSizeMobile: number;
  children: ReactNode;
  className?: string;
};

// The vault illustration with its glow rings, on the vault list and the vault page
export const VaultVisual = ({
  variant,
  iconSize,
  iconSizeMobile,
  children,
  className,
}: VaultVisualProps) => (
  <VisualRoot
    className={className}
    $variant={variant}
    $iconSize={iconSize}
    $iconSizeMobile={iconSizeMobile}
    aria-hidden="true"
  >
    <span data-glow-core />
    {children}
  </VisualRoot>
);
