import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FC,
} from 'react';
import styled from 'styled-components';

import { ReactComponent as LidoManSanta } from 'assets/holidays/lido-man-santa.svg';
import { WINTER_DECOR_Z_INDEX } from 'styles/constants';
import { devicesHeaderMedia } from 'styles/global';

import {
  ANCHOR_FORM,
  ANCHOR_TOP,
  LIDO_MAN_PHRASES,
  WINTER_ANCHOR_ATTR,
} from './constants';
import { ICE_LIP, ICE_LIP_HIGHLIGHTS, ICE_LIP_VIEWBOX } from './shapes';
import { useWinterTheme } from './winter-theme-context';

const LIDO_MAN_W = 132;
const LIDO_MAN_W_MOBILE = 92;
// the cropped Lido-man artwork, see assets/holidays/lido-man-santa.svg
const LIDO_MAN_RATIO = 345 / 480;
const BUBBLE_MS = 3600;

type Box = { left: number; top: number; width: number; height: number };
type Anchors = { top: Box; form: Box; mobile: boolean };

// Under the snow canvas, so drifts and flakes stay in front of Lido-man
const Layer = styled.div`
  position: absolute;
  z-index: ${WINTER_DECOR_Z_INDEX};
  top: 0;
  left: 0;
  width: 100%;
  height: 0;
  pointer-events: none;
`;

// Clips Lido-man at the card edge: he hides behind the card
const LidoManWindow = styled.div`
  position: absolute;
  overflow: hidden;
  pointer-events: none;
`;

const LidoManButton = styled.button<{ $up: boolean }>`
  position: absolute;
  inset: 0;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  pointer-events: auto;
  border-radius: 12px;
  transform: translateY(${({ $up }) => ($up ? 0 : 40)}%);
  transition: transform 0.5s cubic-bezier(0.3, 1.35, 0.5, 1);

  &:hover,
  &:focus-visible {
    transform: translateY(${({ $up }) => ($up ? 0 : 19)}%);
  }

  &:focus-visible {
    outline: 3px solid var(--lido-color-primary);
    outline-offset: -3px;
  }

  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
`;

const Bubble = styled.div`
  position: absolute;
  z-index: ${WINTER_DECOR_Z_INDEX + 2};
  padding: 10px 14px;
  border-radius: 14px;
  background: var(--lido-color-foreground);
  color: var(--lido-color-text);
  box-shadow: 0 6px 20px var(--winter-chip-shadow);
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  white-space: nowrap;
  animation: winter-pop 0.25s ease-out;

  &::after {
    content: '';
    position: absolute;
    left: var(--tail, 16%);
    bottom: -6px;
    width: 12px;
    height: 12px;
    margin-left: -6px;
    transform: rotate(45deg);
    background: inherit;
  }

  @media ${devicesHeaderMedia.mobile} {
    white-space: normal;
    max-width: 180px;
  }
`;

const LiveRegion = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`;

const Icicles = styled.svg`
  position: absolute;
  height: 44px;
  overflow: visible;
  filter: drop-shadow(0 3px 4px var(--winter-ice-shadow));
`;

const toBox = (el: Element, origin: DOMRect): Box => {
  const r = el.getBoundingClientRect();
  return {
    left: r.left - origin.left,
    top: r.top - origin.top,
    width: r.width,
    height: r.height,
  };
};

const sameBox = (a: Box, b: Box) =>
  a.left === b.left &&
  a.top === b.top &&
  a.width === b.width &&
  a.height === b.height;

// Positions of the stake cards relative to the layer, kept fresh while the
// form changes height (wallet connects, banners, errors)
const useAnchors = (layerRef: React.RefObject<HTMLDivElement>) => {
  const [anchors, setAnchors] = useState<Anchors | null>(null);

  const measure = useCallback(() => {
    const layer = layerRef.current;
    const form = document.querySelector(
      `[${WINTER_ANCHOR_ATTR}="${ANCHOR_FORM}"]`,
    );
    if (!layer || !form) {
      setAnchors(null);
      return;
    }
    const top =
      document.querySelector(`[${WINTER_ANCHOR_ATTR}="${ANCHOR_TOP}"]`) ?? form;
    const origin = layer.getBoundingClientRect();
    const next: Anchors = {
      top: toBox(top, origin),
      form: toBox(form, origin),
      mobile: window.matchMedia(devicesHeaderMedia.mobile).matches,
    };
    setAnchors((prev) =>
      prev &&
      prev.mobile === next.mobile &&
      sameBox(prev.top, next.top) &&
      sameBox(prev.form, next.form)
        ? prev
        : next,
    );
  }, [layerRef]);

  // The page grows or shrinks when the form changes (wallet, banners,
  // errors): watch the body instead of polling. A slow fallback tick covers
  // moves that keep the body size, and it skips hidden tabs.
  useEffect(() => {
    measure();
    const observer =
      'ResizeObserver' in window ? new ResizeObserver(() => measure()) : null;
    observer?.observe(document.body);
    const id = setInterval(() => {
      if (!document.hidden) measure();
    }, 1000);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      clearInterval(id);
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  return anchors;
};

export const WinterStakeDecor: FC = () => {
  const { enabled } = useWinterTheme();
  const layerRef = useRef<HTMLDivElement>(null);
  const anchors = useAnchors(layerRef);
  const [up, setUp] = useState(false);
  const [bubbleShown, setBubbleShown] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(-1);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  const poke = useCallback(() => {
    clearTimeout(timer.current);
    setUp(true);
    setBubbleShown(true);
    setPhraseIndex((i) => (i + 1) % LIDO_MAN_PHRASES.length);
    timer.current = setTimeout(() => {
      setUp(false);
      setBubbleShown(false);
    }, BUBBLE_MS);
  }, []);

  if (!enabled) return null;

  let lidoMan: CSSProperties | null = null;
  let bubble: CSSProperties | null = null;
  let icicles: CSSProperties | null = null;

  if (anchors) {
    const { top, form, mobile } = anchors;
    const w = mobile ? LIDO_MAN_W_MOBILE : LIDO_MAN_W;
    const h = Math.round(w * LIDO_MAN_RATIO);
    const left = top.left + top.width - (mobile ? 18 : 14) - w;
    lidoMan = { left, top: top.top - h + 2, width: w, height: h };
    bubble = mobile
      ? {
          right: `calc(100% - ${left + 8}px)`,
          top: top.top - Math.round(h * 0.72),
          ['--tail' as string]: '92%',
        }
      : { left: left + w - 30, top: top.top - h - 8 };
    icicles = {
      left: form.left + 14,
      top: form.top + form.height - 6,
      width: form.width - 28,
    };
  }

  return (
    <Layer ref={layerRef} data-winter="stake-decor">
      {lidoMan && (
        <LidoManWindow style={lidoMan}>
          <LidoManButton
            type="button"
            $up={up}
            onClick={poke}
            aria-label="Lido-man: say GM"
            data-testid="winterLidoMan"
          >
            <LidoManSanta aria-hidden="true" />
          </LidoManButton>
        </LidoManWindow>
      )}
      {bubble && bubbleShown && phraseIndex >= 0 && (
        <Bubble style={bubble} aria-hidden="true">
          {LIDO_MAN_PHRASES[phraseIndex]}
        </Bubble>
      )}
      {/* always mounted, so screen readers announce the phrase */}
      <LiveRegion role="status">
        {bubbleShown && phraseIndex >= 0 ? LIDO_MAN_PHRASES[phraseIndex] : ''}
      </LiveRegion>
      {icicles && (
        <Icicles
          style={icicles}
          viewBox={ICE_LIP_VIEWBOX}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="winter-ice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: 'var(--winter-snow)' }} />
              <stop
                offset="0.16"
                style={{ stopColor: 'var(--winter-ice-0)' }}
              />
              <stop offset="1" style={{ stopColor: 'var(--winter-ice-1)' }} />
            </linearGradient>
          </defs>
          <path d={ICE_LIP} fill="url(#winter-ice)" />
          <path
            d={ICE_LIP_HIGHLIGHTS}
            stroke="#FFFFFF"
            strokeOpacity="0.85"
            strokeWidth="1.2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </Icicles>
      )}
    </Layer>
  );
};
