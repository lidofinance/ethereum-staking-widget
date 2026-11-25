import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FC,
  type PointerEvent,
} from 'react';
import styled, { keyframes } from 'styled-components';

import { useWinterTheme } from './winter-theme-context';

// Rows of icicles (under the stake form, along the header). A click or a quick swipe of the mouse
// knocks one off; it falls, and a while later grows back.

// x in % of the row, sizes in px, rot: spin while falling, deg
export type Icicle = {
  x: number;
  length: number;
  width: number;
  rot: number;
};
type Phase = 'idle' | 'falling' | 'gone' | 'growing';

const COUNT = 18;
const REGROW_MS = [9000, 17_000] as const;
// px of pointer travel between two moves that counts as a swipe
const SWIPE = 9;

// Stable pseudo-random numbers, so the row looks the same on every render
export const noise = (i: number, k: number): number => {
  const s = Math.sin(i * 12.9898 + k * 78.233) * 43_758.5453;
  return s - Math.floor(s);
};

// the row under the stake form
const FORM_ICICLES: Icicle[] = Array.from({ length: COUNT }, (_, i) => {
  const long = noise(i, 1) > 0.55;
  return {
    x: ((i + 0.5 + (noise(i, 2) - 0.5) * 0.6) / COUNT) * 100,
    length: Math.round(long ? 24 + noise(i, 3) * 16 : 8 + noise(i, 3) * 10),
    width: Math.round(7 + noise(i, 4) * 5),
    rot: Math.round((noise(i, 5) - 0.5) * 70),
  };
});

const fall = keyframes`
  0% { transform: rotate(0); opacity: 1; }
  12% { transform: rotate(-5deg); }
  22% { transform: translateY(2px) rotate(3deg); opacity: 1; }
  100% {
    transform: translateY(160px) rotate(var(--rot));
    opacity: 0;
  }
`;

const grow = keyframes`
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
`;

const Row = styled.div`
  position: absolute;
  height: 48px;
  pointer-events: none;
  filter: drop-shadow(0 3px 4px var(--winter-ice-shadow));
`;

// the frozen lip along the card's lower edge
const Lip = styled.svg`
  position: absolute;
  inset: 0 0 auto;
  width: 100%;
  height: 8px;
  display: block;
`;

// wider than the icicle, so it is easy to hit
const Hit = styled.span`
  position: absolute;
  top: 4px;
  padding: 0 4px 6px;
  margin-left: calc(var(--w) / -2 - 4px);
  pointer-events: auto;
  cursor: pointer;
  touch-action: manipulation;

  &[data-phase='gone'] {
    pointer-events: none;
  }
`;

const Ice = styled.span`
  position: relative;
  display: block;
  width: var(--w);
  height: var(--h);
  transform-origin: 50% 0;
  clip-path: polygon(
    0 0,
    100% 0,
    90% 16%,
    78% 32%,
    72% 50%,
    62% 72%,
    55% 90%,
    50% 100%,
    45% 90%,
    38% 72%,
    28% 50%,
    22% 32%,
    10% 16%
  );
  background: linear-gradient(
    180deg,
    var(--winter-snow) 0,
    var(--winter-ice-0) 14%,
    var(--winter-ice-1) 100%
  );

  /* a glint down the icicle */
  &::after {
    content: '';
    position: absolute;
    left: 34%;
    top: 12%;
    width: 1.2px;
    height: 46%;
    border-radius: 1px;
    background: rgba(255, 255, 255, 0.85);
  }

  [data-phase='falling'] > & {
    animation: ${fall} 0.8s cubic-bezier(0.55, 0, 1, 0.45) forwards;
  }
  [data-phase='gone'] > & {
    visibility: hidden;
  }
  [data-phase='growing'] > & {
    animation: ${grow} 1.8s cubic-bezier(0.2, 0.7, 0.3, 1);
  }
`;

const LIP_PATH = (() => {
  let d = 'M0 0 L100 0 L100 4';
  for (let x = 100; x >= 0; x -= 4) {
    d += ` L${x} ${(4.2 + Math.sin(x * 0.9) * 1.1 + noise(x, 6) * 1.6).toFixed(2)}`;
  }
  return `${d} Z`;
})();

type IciclesProps = {
  style: CSSProperties;
  icicles?: Icicle[];
  // a frozen lip along the top; off where something else draws the edge
  lip?: boolean;
};

export const WinterIcicles: FC<IciclesProps> = ({
  style,
  icicles = FORM_ICICLES,
  lip = true,
}) => {
  const { reducedMotion } = useWinterTheme();
  const [phases, setPhases] = useState<Phase[]>(() =>
    icicles.map(() => 'idle'),
  );
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const setPhase = useCallback((i: number, phase: Phase) => {
    setPhases((prev) =>
      prev[i] === phase ? prev : prev.map((p, k) => (k === i ? phase : p)),
    );
  }, []);

  const regrowLater = useCallback(
    (i: number) => {
      const [min, max] = REGROW_MS;
      const delay = min + Math.random() * (max - min);
      timers.current.push(
        setTimeout(
          () => setPhase(i, reducedMotion ? 'idle' : 'growing'),
          delay,
        ),
      );
    },
    [reducedMotion, setPhase],
  );

  const knock = useCallback(
    (i: number) => {
      if (phases[i] !== 'idle') return;
      // no animation to wait for: gone at once
      if (reducedMotion) {
        setPhase(i, 'gone');
        regrowLater(i);
      } else {
        setPhase(i, 'falling');
      }
    },
    [phases, reducedMotion, regrowLater, setPhase],
  );

  const onAnimationEnd = (i: number) => {
    if (phases[i] === 'falling') {
      setPhase(i, 'gone');
      regrowLater(i);
    } else if (phases[i] === 'growing') {
      setPhase(i, 'idle');
    }
  };

  const onPointerMove = (i: number, e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    if (Math.abs(e.movementX) + Math.abs(e.movementY) > SWIPE) knock(i);
  };

  return (
    <Row style={style} aria-hidden="true">
      {lip && (
        <Lip viewBox="0 0 100 8" preserveAspectRatio="none">
          <defs>
            <linearGradient id="winter-ice-lip" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: 'var(--winter-snow)' }} />
              <stop offset="1" style={{ stopColor: 'var(--winter-ice-0)' }} />
            </linearGradient>
          </defs>
          <path d={LIP_PATH} fill="url(#winter-ice-lip)" />
        </Lip>
      )}
      {icicles.map(({ x, length, width, rot }, i) => (
        <Hit
          key={i}
          data-phase={phases[i]}
          style={
            {
              left: `${x.toFixed(2)}%`,
              '--w': `${width}px`,
              '--h': `${length}px`,
              '--rot': `${rot}deg`,
            } as CSSProperties
          }
          onClick={() => knock(i)}
          onPointerMove={(e) => onPointerMove(i, e)}
          onAnimationEnd={() => onAnimationEnd(i)}
        >
          <Ice />
        </Hit>
      ))}
    </Row>
  );
};
