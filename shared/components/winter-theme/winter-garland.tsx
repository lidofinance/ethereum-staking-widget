import { useMemo, type CSSProperties, type FC } from 'react';
import styled, { css } from 'styled-components';

import { devicesHeaderMedia } from 'styles/global';

import type { LightsMode } from './constants';
import { useWinterTheme } from './winter-theme-context';

const COLORS = ['#E14D4D', '#FFC24B', '#00A3FF', '#53BA95', '#C9ACFF'];

type Swag = { from: number; length: number; sag: number };

// Two strands hanging from the top corners, the middle stays clear for
// the title. Swags are deeper at the corners, shallower towards the centre.
type GarlandLayout = { width: number; swags: Swag[]; bulbSpacing: number };

const DESKTOP: GarlandLayout = {
  width: 1440,
  bulbSpacing: 52,
  swags: [
    { from: 0, length: 260, sag: 34 },
    { from: 260, length: 210, sag: 20 },
    { from: 970, length: 210, sag: 20 },
    { from: 1180, length: 260, sag: 34 },
  ],
};
const MOBILE: GarlandLayout = {
  width: 390,
  bulbSpacing: 40,
  swags: [
    { from: 0, length: 130, sag: 24 },
    { from: 260, length: 130, sag: 24 },
  ],
};

type Bulb = { key: number; style: CSSProperties };

// Each swag is a wire between two hooks: one quadratic curve
const buildGarland = ({ width, swags, bulbSpacing }: GarlandLayout) => {
  let path = '';
  const bulbs: Bulb[] = [];
  let i = 0;
  let height = 0;
  for (const { from, length, sag } of swags) {
    const low = 2 + sag * 2;
    height = Math.max(height, low + 10);
    path += ` M${from} 2 Q${from + length / 2} ${low} ${from + length} 2`;
    const count = Math.max(2, Math.round(length / bulbSpacing));
    for (let q = 1; q <= count; q++) {
      const t = q / (count + 1);
      const y = (1 - t) * (1 - t) * 2 + 2 * (1 - t) * t * low + t * t * 2;
      const tilt = (t - 0.5) * -40 + (i % 2 ? 6 : -6);
      bulbs.push({
        key: i,
        style: {
          left: `${(((from + length * t) / width) * 100).toFixed(3)}%`,
          top: `${(y - 5).toFixed(1)}px`,
          transform: `rotate(${tilt.toFixed(1)}deg)`,
          ['--c' as string]: COLORS[i % COLORS.length],
          // each bulb dips in its own rhythm, so the line never pulses as one
          ['--dur' as string]: `${(3.4 + ((i * 7919) % 29) / 10).toFixed(1)}s`,
          ['--d' as string]: `-${((i * 1.37) % 6).toFixed(2)}s`,
          ['--k' as string]: `${((i % 5) * 0.28).toFixed(2)}s`,
        },
      });
      i++;
    }
  }
  return { path: path.trim(), bulbs, height };
};

const modeStyles: Record<LightsMode, ReturnType<typeof css>> = {
  twinkle: css`
    animation: winter-twinkle var(--dur) ease-in-out infinite;
    animation-delay: var(--d);
  `,
  chase: css`
    animation: winter-chase 1.4s ease-out infinite;
    animation-delay: var(--k);
  `,
  steady: css``,
  off: css`
    background: radial-gradient(
      circle at 35% 28%,
      rgba(255, 255, 255, 0.7) 0 1.4px,
      var(--winter-unlit) 3.6px
    );
    box-shadow: none;
  `,
};

const Wrap = styled.div<{ $mobile?: boolean }>`
  position: relative;
  z-index: 1;
  height: 0;
  pointer-events: none;
  display: ${({ $mobile }) => ($mobile ? 'none' : 'block')};

  @media ${devicesHeaderMedia.mobile} {
    display: ${({ $mobile }) => ($mobile ? 'block' : 'none')};
  }
`;

const Wire = styled.svg`
  position: absolute;
  left: 0;
  top: -10px;
  width: 100%;
  display: block;
`;

const BulbStyle = styled.span<{ $mode: LightsMode }>`
  position: absolute;
  width: 11px;
  height: 16px;
  margin-left: -5.5px;
  margin-top: -10px;
  border-radius: 50% 50% 50% 50% / 42% 42% 58% 58%;
  transform-origin: 50% -5px;
  background: radial-gradient(
    circle at 35% 28%,
    rgba(255, 255, 255, 0.95) 0 1.4px,
    var(--c) 3.6px
  );
  box-shadow: 0 0 12px 2px color-mix(in srgb, var(--c) 65%, transparent);

  &::before {
    content: '';
    position: absolute;
    left: 2.5px;
    top: -5px;
    width: 6px;
    height: 6px;
    border-radius: 1.5px;
    background: #5e6b6a;
  }

  ${({ $mode }) => modeStyles[$mode]}
`;

const Garland: FC<{ layout: GarlandLayout; mobile?: boolean }> = ({
  layout,
  mobile,
}) => {
  const { lights } = useWinterTheme();
  const { path, bulbs, height } = useMemo(() => buildGarland(layout), [layout]);

  return (
    <Wrap $mobile={mobile} aria-hidden="true" data-winter="garland">
      <Wire
        height={height}
        viewBox={`0 0 ${layout.width} ${height}`}
        preserveAspectRatio="none"
      >
        <path
          d={path}
          fill="none"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          style={{ stroke: 'var(--winter-wire)' }}
        />
      </Wire>
      {bulbs.map(({ key, style }) => (
        <BulbStyle key={key} style={style} $mode={lights} />
      ))}
    </Wrap>
  );
};

export const WinterGarland: FC = () => {
  const { enabled } = useWinterTheme();
  if (!enabled) return null;
  return (
    <>
      <Garland layout={DESKTOP} />
      <Garland layout={MOBILE} mobile />
    </>
  );
};
