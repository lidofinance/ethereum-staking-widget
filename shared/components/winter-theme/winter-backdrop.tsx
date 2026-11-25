import { useMemo, useRef, type FC } from 'react';
import styled from 'styled-components';

import { devicesHeaderMedia } from 'styles/global';

import { AuroraPainter } from './aurora';
import { HILLS, HILLS_VIEWBOX } from './shapes';
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
  z-index: -1;
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

const AuroraCanvas = styled.canvas`
  position: absolute;
  left: 0;
  top: 18vh;
  width: 100%;
  height: 62vh;
  mix-blend-mode: screen;
  opacity: 0.85;
  filter: blur(4px) saturate(1.7) brightness(1.15);
  animation: winter-aurora-hue 11s ease-in-out infinite alternate;

  @media ${devicesHeaderMedia.mobile} {
    top: 14vh;
    height: 52vh;
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
  height: 260px;

  @media ${devicesHeaderMedia.mobile} {
    bottom: ${HORIZON_MOBILE};
    height: 200px;
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
  const { reducedMotion } = useWinterTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const painter = useMemo(() => new AuroraPainter(), []);
  const stars = useStars();
  const lastDraw = useRef(0);

  useAnimationFrame((time) => {
    // ~30 fps is plenty for a slow curtain
    if (time - lastDraw.current < 33) return;
    lastDraw.current = time;
    if (canvasRef.current) {
      painter.draw(canvasRef.current, reducedMotion ? 40000 : time);
    }
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
