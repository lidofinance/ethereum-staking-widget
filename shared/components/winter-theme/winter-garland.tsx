import { useMemo, type CSSProperties, type FC } from 'react';
import styled, { css } from 'styled-components';

import { devicesHeaderMedia } from 'styles/global';

import type { LightsMode } from './constants';
import {
  WinterIcicles,
  noise as icicleNoise,
  type Icicle,
} from './winter-icicles';
import { useWinterTheme } from './winter-theme-context';

// A frozen eave with icicles runs along the bottom edge of the header.
// Lights hang from hooks on it only at the sides, in loops that get
// shallower towards the middle; the eave over the title stays bare.
type GarlandLayout = {
  width: number;
  hooks: number[];
  // depth of the loop after each hook, px; 0 leaves that span bare
  sags: number[];
  spacing: number;
  icicles: Icicle[];
};

// the wires leave the hooks just under the eave
const HOOK_Y = 4;
const EAVE_H = 12;

type Bulb = { key: number; style: CSSProperties };

const quad = (t: number, low: number) =>
  (1 - t) * (1 - t) * HOOK_Y + 2 * (1 - t) * t * low + t * t * HOOK_Y;

// The frosted edge of the eave: a thin lumpy band, the icicles hang below
const buildEave = (width: number) => {
  const step = width / 96;
  let d = `M0 6.4`;
  for (let k = 0; k <= 96; k++) {
    d += ` L${(k * step).toFixed(1)} ${(3.6 + icicleNoise(k, 13) * 1.4).toFixed(2)}`;
  }
  return `${d} L${width} 6.4 Z`;
};

// Sparse icicles, thicker towards the sides where the lights hang, almost
// none over the title
const buildEaveIcicles = (slots: number): Icicle[] => {
  const icicles: Icicle[] = [];
  for (let i = 0; i < slots; i++) {
    const x = ((i + 0.5 + (icicleNoise(i, 7) - 0.5) * 0.7) / slots) * 100;
    const edge = Math.abs(x - 50) / 50;
    if (icicleNoise(i, 8) > 0.15 + 0.75 * edge ** 1.5) continue;
    const long = icicleNoise(i, 9) > 0.6;
    icicles.push({
      x,
      length: Math.round(
        (long ? 11 + icicleNoise(i, 10) * 7 : 4 + icicleNoise(i, 10) * 5) *
          (0.6 + 0.4 * edge),
      ),
      width: Math.round(4 + icicleNoise(i, 11) * 3),
      rot: Math.round((icicleNoise(i, 12) - 0.5) * 70),
    });
  }
  return icicles;
};

const ICICLE_ROW: CSSProperties = { left: 0, width: '100%', top: -2 };

const DESKTOP: GarlandLayout = {
  width: 1440,
  icicles: buildEaveIcicles(72),
  spacing: 30,
  hooks: [0, 190, 380, 1060, 1250, 1440],
  sags: [24, 16, 0, 16, 24],
};
const MOBILE: GarlandLayout = {
  width: 390,
  icicles: buildEaveIcicles(22),
  spacing: 24,
  hooks: [0, 100, 290, 390],
  sags: [16, 0, 16],
};

// Each wire is one quadratic curve between two hooks
const buildGarland = ({ width, hooks, sags, spacing }: GarlandLayout) => {
  let path = '';
  const bulbs: Bulb[] = [];
  let i = 0;
  let height = 0;
  hooks.slice(0, -1).forEach((from, h) => {
    if (!sags[h]) return;
    const length = hooks[h + 1] - from;
    const low = HOOK_Y + sags[h] * 2;
    height = Math.max(height, low + 8);
    path += ` M${from} ${HOOK_Y} Q${from + length / 2} ${low} ${from + length} ${HOOK_Y}`;
    const count = Math.max(3, Math.round(length / spacing));
    for (let q = 1; q < count; q++) {
      const t = q / count;
      const x = from + length * t;
      bulbs.push({
        key: i,
        style: {
          left: `${((x / width) * 100).toFixed(3)}%`,
          top: `${quad(t, low).toFixed(1)}px`,
          // each light sparkles in its own rhythm
          ['--dur' as string]: `${(2.6 + ((i * 7919) % 31) / 10).toFixed(1)}s`,
          ['--d' as string]: `-${((i * 1.37) % 6).toFixed(2)}s`,
          // the chase runs along the garland, left to right
          ['--k' as string]: `${((x / width) * 2.4).toFixed(2)}s`,
        },
      });
      i++;
    }
  });
  return { path: path.trim(), bulbs, height, eave: buildEave(width) };
};

const modeStyles: Record<LightsMode, ReturnType<typeof css>> = {
  twinkle: css`
    animation: winter-twinkle var(--dur) ease-in-out infinite;
    animation-delay: var(--d);
  `,
  chase: css`
    animation: winter-chase 2.4s ease-in-out infinite;
    animation-delay: var(--k);
  `,
  steady: css``,
  off: css`
    background: var(--winter-unlit);
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
  top: 0;
  width: 100%;
  display: block;
  opacity: 0.8;
`;

// a micro LED: a small warm point with a soft halo
const BulbStyle = styled.span<{ $mode: LightsMode }>`
  position: absolute;
  width: 4px;
  height: 4px;
  margin: -2px 0 0 -2px;
  border-radius: 50%;
  background: var(--winter-light-core);
  box-shadow:
    0 0 2px 1px var(--winter-light-glow),
    0 0 7px 2px var(--winter-light-halo);

  ${({ $mode }) => modeStyles[$mode]}
`;

// the icy eave over the header's lower edge, on top of the wire ends
const Eave = styled.svg`
  position: absolute;
  left: 0;
  top: -5px;
  width: 100%;
  height: ${EAVE_H}px;
  display: block;
  overflow: visible;
  filter: drop-shadow(0 2px 2px var(--winter-drift-shadow));
`;

const Hook = styled.span`
  position: absolute;
  top: 1px;
  width: 3px;
  height: 5px;
  margin-left: -1.5px;
  border-radius: 1px;
  background: var(--winter-wire);
`;

const Garland: FC<{ layout: GarlandLayout; mobile?: boolean }> = ({
  layout,
  mobile,
}) => {
  const { lights } = useWinterTheme();
  const { path, bulbs, height, eave } = useMemo(
    () => buildGarland(layout),
    [layout],
  );

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
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          style={{ stroke: 'var(--winter-wire)' }}
        />
      </Wire>
      {bulbs.map(({ key, style }) => (
        <BulbStyle key={key} style={style} $mode={lights} />
      ))}
      {layout.hooks.slice(1, -1).map((x) => (
        <Hook
          key={x}
          style={{ left: `${((x / layout.width) * 100).toFixed(3)}%` }}
        />
      ))}
      <Eave
        viewBox={`0 0 ${layout.width} ${EAVE_H}`}
        preserveAspectRatio="none"
      >
        <path
          d={`M0 6 H${layout.width} V8.4 H0 Z`}
          style={{ fill: 'var(--winter-eave)' }}
        />
        <path d={eave} style={{ fill: 'var(--winter-ice-0)' }} />
      </Eave>
      <WinterIcicles style={ICICLE_ROW} icicles={layout.icicles} lip={false} />
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
