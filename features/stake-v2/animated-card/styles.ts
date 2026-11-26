import { Card } from '@lidofinance/lido-app-ui';
import styled, { css, keyframes } from 'styled-components';

import { BLOB_BAND_Y } from './liquid-renderer';

export const CardWithBackground = styled(Card)`
  position: relative;
  /* own stacking context: the z-index -1 background paints above the
     card surface but below the content, without touching the children */
  isolation: isolate;
`;

// Geometry mirrors the Figma frame: an anchor off the card's top-right
// corner, a box rotated 8.48deg, and the artwork overflowing that box by
// its 80px blur margin on every side

type BlobAnchorProps = {
  /** vertical shift of the whole blob, px; positive moves it down */
  $offsetY: number;
};

export const BlobAnchor = styled.div<BlobAnchorProps>`
  position: absolute;
  z-index: -1;
  top: calc(-144px + ${({ $offsetY }) => $offsetY}px);
  right: -159.86px;
  width: 793.86px;
  height: 421.967px;

  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

export const BlobRotation = styled.div`
  position: relative;
  flex: none;
  width: 755.836px;
  height: 314px;
  transform: rotate(8.48deg);
`;

const drift = keyframes`
  0% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
  33% {
    transform: translate(-18px, 10px) rotate(-2deg) scale(1.03);
  }
  66% {
    transform: translate(14px, -6px) rotate(1.5deg) scale(0.98);
  }
  100% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
`;

type BlobArtProps = {
  /** box height, px: the Figma artwork stretched by `scaleY` */
  $height: number;
  /** `scaleY` for the SVG, which cannot re-lay itself out like the shader */
  $svgScaleY?: number;
  $visible: boolean;
  $animated?: boolean;
  /** opacity fade, long enough to read as a fade-in on boot, not a pop */
  $fadeMs: number;
  $blurPx?: number;
};

export const BlobArt = styled.div<BlobArtProps>`
  position: absolute;
  inset: -25.48% -10.58% auto;
  height: ${({ $height }) => $height}px;

  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity ${({ $fadeMs }) => $fadeMs}ms
    var(--lido-app-ui-easing-out);

  ${({ $blurPx }) =>
    !!$blurPx &&
    css`
      filter: blur(${$blurPx}px);
    `}

  ${({ $animated }) =>
    $animated &&
    css`
      animation: ${drift} 12s ease-in-out infinite;
    `}

  & > svg,
  & > canvas {
    display: block;
  }

  & > canvas {
    width: 100%;
    height: 100%;
  }

  ${({ $svgScaleY }) =>
    !!$svgScaleY &&
    $svgScaleY !== 1 &&
    css`
      & > svg {
        transform: scaleY(${$svgScaleY});
        transform-origin: 50% ${BLOB_BAND_Y}px;
      }
    `}
`;

// forced shader failed (controls panel): impossible to miss on a stand
export const ShaderFailed = styled.div`
  position: absolute;
  z-index: -1;
  inset: 0;
  background: rgba(255, 0, 0, 0.55);
  pointer-events: none;
`;

export const ShaderFailedLabel = styled.span`
  position: absolute;
  right: 12px;
  bottom: 8px;
  font:
    600 12px/1.4 ui-monospace,
    Menlo,
    monospace;
  color: #fff;
`;
