import { useMemo, useRef, type CSSProperties, type FC } from 'react';
import styled from 'styled-components';

import { WINTER_BACKDROP_Z_INDEX } from 'styles/constants';
import { devicesHeaderMedia } from 'styles/global';

import { AuroraPainter } from './aurora';
import { HILLS, HILLS_VIEWBOX } from './shapes';
import { buildTreeLights } from './tree-lights';
import { useAnimationFrame } from './use-animation-frame';
import { useWinterTheme } from './winter-theme-context';

// A fixed scene the page scrolls over: sky and lights fill the viewport,
// the horizon sits a little above its bottom edge (above the mobile
// navigation bar on phones), snowy ground below it
const HORIZON = '9vh';
const HORIZON_MOBILE =
  'calc(var(--nav-mobile-height) + var(--nav-mobile-bottom-inset) + 3vh)';

const Backdrop = styled.div`
  position: fixed;
  z-index: ${WINTER_BACKDROP_Z_INDEX};
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    var(--winter-sky-0) 0%,
    var(--winter-sky-1) 55%,
    var(--winter-sky-2) 85%,
    var(--winter-sky-2) 100%
  );
`;

const Night = styled.div`
  display: var(--winter-night-display);
`;

const Star = styled.span`
  position: absolute;
  border-radius: 50%;
  background: #fff;
  animation: winter-star 3.2s ease-in-out infinite;
`;

const Moon = styled.div`
  position: absolute;
  right: 12%;
  top: 170px;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 38% 36%,
    #fff8e2 0%,
    #f3e7c2 60%,
    #e2d3a6 100%
  );
  box-shadow:
    0 0 40px 10px rgba(255, 240, 200, 0.18),
    0 0 120px 40px rgba(160, 180, 255, 0.1);

  /* fixed in place, it would sit under the content column on a phone */
  @media ${devicesHeaderMedia.mobile} {
    display: none;
  }
`;

// The canvas box is a third of the area and scaled up by a transform:
// the blur runs on that small layer, so it is smooth and is not split into
// tiles (a full-size blurred layer showed seams and banding). The mask
// fades the curtains out at the top and bottom instead of cutting them.
const AURORA_SCALE = 3;

const AuroraCanvas = styled.canvas`
  position: absolute;
  left: 0;
  top: 10vh;
  width: calc(100% / ${AURORA_SCALE});
  height: calc(72vh / ${AURORA_SCALE});
  transform: scale(${AURORA_SCALE});
  transform-origin: 0 0;
  /* no mix-blend-mode: blending with the sky is done per compositor tile
     and left a visible seam; the rays already add up inside the canvas */
  will-change: transform;
  opacity: 0.85;
  filter: blur(1.4px) saturate(1.7) brightness(1.15);
  animation: winter-aurora-hue 11s ease-in-out infinite alternate;
  mask-image: linear-gradient(
    180deg,
    transparent 0%,
    #000 28%,
    #000 85%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    180deg,
    transparent 0%,
    #000 28%,
    #000 85%,
    transparent 100%
  );

  @media ${devicesHeaderMedia.mobile} {
    top: 18vh;
    height: calc(48vh / ${AURORA_SCALE});
    opacity: 0.6;
  }
`;

// Day: a soft haze in the Lido gradient colours instead of the aurora
const Haze = styled.div`
  display: var(--winter-day-display);
  position: absolute;
  left: -10%;
  right: -10%;
  bottom: calc(${HORIZON} + 90px);
  height: 200px;
  border-radius: 50%;
  filter: blur(36px);
  opacity: 0.55;
  background: linear-gradient(
    90deg,
    rgba(106, 154, 255, 0) 0%,
    rgba(106, 154, 255, 0.35) 25%,
    rgba(201, 172, 255, 0.4) 52%,
    rgba(255, 206, 190, 0.55) 78%,
    rgba(255, 206, 190, 0) 100%
  );
  animation: winter-haze 14s ease-in-out infinite alternate;

  @media ${devicesHeaderMedia.mobile} {
    bottom: calc(${HORIZON_MOBILE} + 60px);
  }
`;

const Hills = styled.svg`
  position: absolute;
  left: 0;
  bottom: ${HORIZON};
  width: 100%;
  /* grows with the width: a fixed height would make "slice" crop the far
     forest flat on wide screens */
  height: max(260px, calc(100vw * 260 / 1440));

  @media ${devicesHeaderMedia.mobile} {
    bottom: ${HORIZON_MOBILE};
    height: 200px;
  }
`;

const TREE_LIGHTS = buildTreeLights(HILLS.midForest);

// a warm point with a soft halo; twinkles unless the lights are steady
const TreeLights = styled.g<{ $twinkle: boolean }>`
  circle {
    animation: ${({ $twinkle }) =>
      $twinkle ? 'winter-tree-light var(--dur) ease-in-out infinite' : 'none'};
    animation-delay: var(--d);
  }
`;

// snowfield under the horizon, the colour the hills' near slope fades into
const Ground = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(${HORIZON} + 2px);
  background: var(--lido-color-background);

  @media ${devicesHeaderMedia.mobile} {
    height: calc(${HORIZON_MOBILE} + 2px);
  }
`;

// a fixed moment of the animation for prefers-reduced-motion
const STILL_AURORA_TIME = 40000;

const STAR_COUNT = 70;

const useStars = () =>
  useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, (_, i) => {
        // deterministic pseudo-random spread
        const a = ((i * 9301 + 49297) % 233280) / 233280;
        const b = ((i * 4271 + 1013) % 9973) / 9973;
        const size = 1 + Math.round(b * 2);
        return {
          left: `${(a * 100).toFixed(2)}%`,
          top: `${(8 + b * 52).toFixed(1)}%`,
          width: size,
          height: size,
          animationDelay: `-${(a * 4).toFixed(1)}s`,
        };
      }),
    [],
  );

export const WinterBackdrop: FC = () => {
  const { reducedMotion, lights } = useWinterTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const painter = useMemo(() => new AuroraPainter(), []);
  const stars = useStars();
  const nextDraw = useRef(0);

  useAnimationFrame((time) => {
    if (time < nextDraw.current || !canvasRef.current) return;
    const visible = painter.draw(
      canvasRef.current,
      reducedMotion ? STILL_AURORA_TIME : time,
    );
    // ~30 fps for a slow curtain; a still aurora (reduced motion) and a
    // hidden one (light theme) only check back once a second, for a
    // resize or a theme switch
    nextDraw.current = time + (visible && !reducedMotion ? 33 : 1000);
  }, true);

  return (
    <Backdrop aria-hidden="true" data-winter="backdrop">
      <Night>
        {stars.map((style, i) => (
          <Star key={i} style={style} />
        ))}
        <AuroraCanvas ref={canvasRef} />
        <Moon />
      </Night>
      <Haze />
      <Ground />
      <Hills viewBox={HILLS_VIEWBOX} preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="winter-near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--winter-near-top)' }} />
            <stop
              offset="0.45"
              style={{ stopColor: 'var(--lido-color-background)' }}
            />
          </linearGradient>
        </defs>
        <path d={HILLS.far} style={{ fill: 'var(--winter-far)' }} />
        <path
          d={HILLS.farForest}
          style={{ fill: 'var(--winter-far-forest)' }}
        />
        <path d={HILLS.mid} style={{ fill: 'var(--winter-mid)' }} />
        <path
          d={HILLS.midForest}
          style={{ fill: 'var(--winter-mid-forest)' }}
        />
        <path d={HILLS.midCaps} style={{ fill: 'var(--winter-mid-caps)' }} />
        {lights !== 'off' && (
          <TreeLights $twinkle={lights !== 'steady'}>
            {TREE_LIGHTS.map(({ x, y, delay, duration }, i) => (
              <g
                key={i}
                style={
                  {
                    '--d': `${delay.toFixed(2)}s`,
                    '--dur': `${duration.toFixed(1)}s`,
                  } as CSSProperties
                }
              >
                <circle
                  cx={x.toFixed(1)}
                  cy={y.toFixed(1)}
                  r="2.6"
                  style={{ fill: 'var(--winter-light-halo)' }}
                />
                <circle
                  cx={x.toFixed(1)}
                  cy={y.toFixed(1)}
                  r="0.9"
                  style={{ fill: 'var(--winter-light-core)' }}
                />
              </g>
            ))}
          </TreeLights>
        )}
        <path d={HILLS.near} fill="url(#winter-near)" />
        <path
          d={HILLS.nearRim}
          fill="none"
          style={{ stroke: 'var(--winter-near-rim)' }}
          strokeWidth="2"
        />
      </Hills>
    </Backdrop>
  );
};
