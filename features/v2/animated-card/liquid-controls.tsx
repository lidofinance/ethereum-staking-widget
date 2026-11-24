import { useState } from 'react';
import styled from 'styled-components';

import {
  DEFAULT_LIQUID_PARAMS,
  resetLiquidParams,
  setLiquidParams,
  useLiquidParams,
  type LiquidParams,
  type LiquidSource,
} from './liquid-params';

// Dev-only tuning panel for the liquid background. Values are shown as a
// ready-to-paste DEFAULT_LIQUID_PARAMS literal.

type NumericKey = {
  [K in keyof LiquidParams]: LiquidParams[K] extends number ? K : never;
}[keyof LiquidParams];

type Slider = { key: NumericKey; min: number; max: number; step: number };

const SLIDERS: Slider[] = [
  { key: 'speed', min: 0, max: 3, step: 0.05 },
  { key: 'speedRamp', min: 0, max: 5, step: 0.1 },
  { key: 'intensity', min: 0, max: 1, step: 0.01 },
  { key: 'threshold', min: 0, max: 2, step: 0.005 },
  { key: 'softness', min: 0, max: 1.5, step: 0.005 },
  { key: 'warpAmount', min: 0, max: 300, step: 1 },
  { key: 'warpScale', min: 40, max: 600, step: 5 },
  { key: 'tendrils', min: 0, max: 3, step: 0.05 },
  { key: 'drift', min: 0, max: 1, step: 0.01 },
  { key: 'edgeFade', min: 0, max: 200, step: 1 },
  { key: 'resolution', min: 0.1, max: 1, step: 0.05 },
  { key: 'blurPx', min: 0, max: 60, step: 1 },
  { key: 'fadeInMs', min: 0, max: 4000, step: 50 },
];

const SOURCES: LiquidSource[] = ['auto', 'shader', 'svg'];

// sliders that only apply while blur is on
const BLUR_KEYS: NumericKey[] = ['softness', 'blurPx'];

// shown in the ⓘ popover next to each control
const INFO: Record<keyof LiquidParams, string> = {
  source:
    'Which renderer draws the blob. auto is the production behaviour: shader, or the SVG when WebGL is missing, slow to start or reduced motion is on. shader / svg force one to compare.',
  blur: 'Master switch for all softening. Off draws the bare shape with a hard edge, handy for tuning the shape sliders.',
  speed:
    'How fast the blob moves: shader seconds per real second. 0 freezes it.',
  speedRamp:
    'Seconds the motion takes to ease up to full speed after boot. 0 starts at full speed.',
  intensity:
    'Peak opacity of the blob, reached in its densest part. 1 is solid colour.',
  threshold:
    'Where the edge of the blob sits. Lower grows and merges the blob; higher shrinks it into separate puddles.',
  softness:
    'Width of the soft edge around the threshold. Higher is hazier, gas-like; lower is a crisper liquid edge. Only with blur on.',
  warpAmount:
    'How far noise pushes the outline, in px. 0 gives smooth round balls; higher is wobblier.',
  warpScale:
    'Size of the noise features, in px. Small gives fine ripples; large gives broad slow waves.',
  tendrils:
    'Strength of the drips hanging below the top band. 0 hides them; 1 matches the Figma shape.',
  drift:
    'How far each ball orbits its spot, as a fraction of its radius. Higher means more shape-shifting.',
  edgeFade:
    'Width of the fade at the canvas edges, in px. Hides hard cuts when the blob drifts to an edge.',
  resolution:
    'Canvas pixel scale. 0.5 renders at half size, a quarter of the GPU work, hidden by the blur. Use 1 to judge hard edges.',
  blurPx:
    'Extra CSS blur on the canvas, in px, on top of softness. Costs GPU time every frame. Only with blur on.',
  fadeInMs:
    'Duration of the boot fade-in and of the shader/SVG cross-fade, ms.',
};

const Name = ({ name }: { name: keyof LiquidParams }) => (
  <NameCell>
    {name}
    <Info tabIndex={0} aria-label={INFO[name]}>
      ⓘ<Popover role="tooltip">{INFO[name]}</Popover>
    </Info>
  </NameCell>
);

const decimals = (step: number) => (String(step).split('.')[1] ?? '').length;

const toLiteral = (params: LiquidParams) =>
  [
    '{',
    ...Object.entries(params).map(([key, value]) => {
      const literal = typeof value === 'string' ? `'${value}'` : value;
      return `  ${key}: ${literal},`;
    }),
    '}',
  ].join('\n');

export const LiquidControls = () => {
  const params = useLiquidParams();
  const [isOpen, setIsOpen] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(toLiteral(params));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1200);
    } catch {
      // clipboard blocked: the literal is on screen to copy by hand
    }
  };

  if (!isOpen) {
    return (
      <Panel>
        <Button onClick={() => setIsOpen(true)}>Liquid controls</Button>
      </Panel>
    );
  }

  return (
    <Panel>
      <Header>
        <strong>Liquid controls</strong>
        <Button onClick={() => setIsOpen(false)}>Hide</Button>
      </Header>

      <Row $changed={params.source !== DEFAULT_LIQUID_PARAMS.source}>
        <Name name="source" />
        <select
          value={params.source}
          onChange={(event) =>
            setLiquidParams({ source: event.target.value as LiquidSource })
          }
        >
          {SOURCES.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
      </Row>

      <Row $changed={params.blur !== DEFAULT_LIQUID_PARAMS.blur}>
        <Name name="blur" />
        <input
          type="checkbox"
          checked={params.blur}
          onChange={(event) => setLiquidParams({ blur: event.target.checked })}
        />
      </Row>

      {SLIDERS.map(({ key, min, max, step }) => {
        const value = params[key];
        const isChanged = value !== DEFAULT_LIQUID_PARAMS[key];
        return (
          <Row key={key} $changed={isChanged}>
            <Name name={key} />
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              disabled={BLUR_KEYS.includes(key) && !params.blur}
              onChange={(event) =>
                setLiquidParams({ [key]: Number(event.target.value) })
              }
              onDoubleClick={() =>
                setLiquidParams({ [key]: DEFAULT_LIQUID_PARAMS[key] })
              }
            />
            <Value>{value.toFixed(decimals(step))}</Value>
          </Row>
        );
      })}

      <Literal>{toLiteral(params)}</Literal>

      <Header>
        <Button onClick={copy}>{isCopied ? 'Copied' : 'Copy values'}</Button>
        <Button onClick={resetLiquidParams}>Reset</Button>
      </Header>
      <Hint>Double-click a slider to reset it. Bold = changed.</Hint>
    </Panel>
  );
};

const Panel = styled.div`
  position: fixed;
  z-index: 1000;
  right: 16px;
  bottom: 16px;
  width: 320px;
  max-height: calc(100vh - 32px);
  overflow: auto;
  padding: 12px;
  border-radius: 12px;

  display: flex;
  flex-direction: column;
  gap: 6px;

  font:
    12px/1.4 ui-monospace,
    Menlo,
    monospace;
  color: #e6e6e6;
  background: rgba(20, 20, 24, 0.92);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const Row = styled.div<{ $changed?: boolean }>`
  position: relative;
  display: grid;
  grid-template-columns: 96px 1fr 48px;
  align-items: center;
  gap: 8px;
  font-weight: ${({ $changed }) => ($changed ? 700 : 400)};
  color: ${({ $changed }) => ($changed ? '#7faaff' : 'inherit')};

  & > input[type='range'] {
    width: 100%;
  }
`;

const NameCell = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
`;

const Popover = styled.span`
  position: absolute;
  z-index: 1;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  padding: 8px;
  border-radius: 8px;

  font-weight: 400;
  white-space: normal;
  color: #e6e6e6;
  background: #2c2c34;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);

  visibility: hidden;
  opacity: 0;
  transition: opacity 120ms;
  pointer-events: none;
`;

const Info = styled.span`
  cursor: help;
  opacity: 0.6;

  &:hover,
  &:focus-visible {
    opacity: 1;
    outline: none;
  }

  &:hover > ${Popover}, &:focus-visible > ${Popover} {
    visibility: visible;
    opacity: 1;
  }
`;

const Value = styled.span`
  text-align: right;
`;

const Literal = styled.pre`
  margin: 6px 0 0;
  padding: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  white-space: pre;
  user-select: all;
`;

const Button = styled.button`
  padding: 4px 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font: inherit;
  color: inherit;
  background: transparent;
  cursor: pointer;
`;

const Hint = styled.span`
  opacity: 0.6;
`;
