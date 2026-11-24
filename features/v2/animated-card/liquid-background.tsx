import { useEffect, useRef, useState } from 'react';
import { useThemeToggle } from '@lidofinance/lido-ui';

import { ReactComponent as BlobDarkSVG } from './assets/blob-dark.svg';
import { ReactComponent as BlobLightSVG } from './assets/blob-light.svg';
import { useLiquidParams } from './liquid-params';
import {
  LOWEST_LEVEL,
  loadRememberedLevel,
  rememberLevel,
  setLiquidStatus,
  type PerfLevel,
} from './liquid-perf';
import {
  createLiquidRenderer,
  type BlobPalette,
  type LiquidFailure,
  type LiquidRenderer,
  type RGB,
} from './liquid-renderer';
import {
  BlobAnchor,
  BlobArt,
  BlobRotation,
  ShaderFailed,
  ShaderFailedLabel,
} from './styles';
import { usePrefersReducedMotion } from './use-prefers-reduced-motion';

const hexToRgb = (hex: string): RGB => {
  const value = parseInt(hex.slice(1), 16);
  return [
    ((value >> 16) & 0xff) / 255,
    ((value >> 8) & 0xff) / 255,
    (value & 0xff) / 255,
  ];
};

// gradient stops of the Figma blob in each theme (same as the SVG assets)
const PALETTES: Record<'light' | 'dark', BlobPalette> = {
  light: { from: hexToRgb('#7FAAFF'), to: hexToRgb('#0085FF') },
  dark: { from: hexToRgb('#638FE0'), to: hexToRgb('#006DD6') },
};

// how long to wait for the shader before fading the SVG in instead; the
// shader still cross-fades over it if it gets ready later
const FALLBACK_DELAY_MS = 1000;

type Mode = 'pending' | 'shader' | 'fallback' | 'failed';
type SkipReason = 'reduced motion' | 'data saver' | 'remembered as too slow';

const isSaveData = () =>
  !!(navigator as Navigator & { connection?: { saveData?: boolean } })
    .connection?.saveData;

/**
 * Liquid blob behind the top of the card. Starts transparent and fades in
 * once a source is ready: the shader after its first frames are drawn, or
 * the Figma SVG when the shader is skipped (reduced motion, data saver, a
 * device that was too slow before), unavailable (no hardware GPU), slow to
 * start, too slow to hold its frame rate, or its context is lost.
 *
 * `source: 'shader'` (controls panel) disables every fallback and paints
 * the card red when the shader fails, so failures are visible on stands.
 */
export const LiquidBackground = () => {
  const { themeName } = useThemeToggle();
  const isDark = themeName === 'dark';
  const palette = isDark ? PALETTES.dark : PALETTES.light;
  const params = useLiquidParams();

  const isReducedMotion = usePrefersReducedMotion();
  const isStrict = params.source === 'shader';
  // `svg` only pauses the shader, so switching back is instant
  const isPaused = params.source === 'svg';

  const [mode, setMode] = useState<Mode>('pending');
  const [failure, setFailure] = useState<LiquidFailure | SkipReason | null>(
    null,
  );
  const [level, setLevel] = useState<PerfLevel | null>(null);
  const isTooSlow = level === 'svg' && !isStrict;
  const shouldRun = !isPaused && !isTooSlow;

  const canvasSlotRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<LiquidRenderer | null>(null);
  const syncRunningRef = useRef<(() => void) | null>(null);
  const paletteRef = useRef(palette);
  paletteRef.current = palette;
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const shouldRunRef = useRef(shouldRun);
  shouldRunRef.current = shouldRun;

  useEffect(() => {
    const slot = canvasSlotRef.current;
    if (!slot) return;

    const fail = (reason: LiquidFailure | SkipReason) => {
      setFailure(reason);
      setLevel(null);
      setMode(isStrict ? 'failed' : 'fallback');
    };

    const remembered = loadRememberedLevel();
    if (!isStrict) {
      const skip: SkipReason | null =
        (isReducedMotion && 'reduced motion') ||
        (isSaveData() && 'data saver') ||
        (remembered === 'svg' &&
          paramsRef.current.quality === 'auto' &&
          'remembered as too slow') ||
        null;
      if (skip) {
        fail(skip);
        return;
      }
    }

    // a fresh canvas per renderer: destroy() loses the WebGL context, and a
    // canvas with a lost context hands the dead context back forever
    const canvas = document.createElement('canvas');
    slot.appendChild(canvas);

    const startLevel = remembered === 'svg' ? LOWEST_LEVEL : remembered;
    setLevel(startLevel);
    setFailure(null);

    const created = createLiquidRenderer(canvas, {
      palette: paletteRef.current,
      params: paramsRef.current,
      level: startLevel,
      strict: isStrict,
      onReady: () => setMode('shader'),
      onError: fail,
      onLevelChange: (next) => {
        setLevel(next);
        if (paramsRef.current.quality === 'auto') rememberLevel(next);
      },
      onStats: (perf) => setLiquidStatus({ perf }),
    });
    if (!created.renderer) {
      canvas.remove();
      fail(created.failure);
      return;
    }
    const { renderer } = created;
    rendererRef.current = renderer;
    setLiquidStatus({ gpu: renderer.gpu, perf: null });

    const fallbackTimer = isStrict
      ? undefined
      : setTimeout(
          () =>
            setMode((current) =>
              current === 'pending' ? 'fallback' : current,
            ),
          FALLBACK_DELAY_MS,
        );

    let isContextLost = false;
    const onContextLost = (event: Event) => {
      event.preventDefault();
      isContextLost = true;
      renderer.stop();
      fail('context lost');
    };
    canvas.addEventListener('webglcontextlost', onContextLost);

    // frames only while the card is on screen and the shader is wanted
    let isOnScreen = false;
    const syncRunning = () => {
      if (isOnScreen && shouldRunRef.current && !isContextLost) {
        renderer.start();
      } else {
        renderer.stop();
      }
    };
    syncRunningRef.current = syncRunning;

    const observer = new IntersectionObserver(([entry]) => {
      isOnScreen = !!entry?.isIntersecting;
      syncRunning();
    });
    observer.observe(canvas);

    return () => {
      clearTimeout(fallbackTimer);
      observer.disconnect();
      canvas.removeEventListener('webglcontextlost', onContextLost);
      renderer.destroy();
      canvas.remove();
      rendererRef.current = null;
      syncRunningRef.current = null;
      setMode('pending');
    };
  }, [isReducedMotion, isStrict]);

  useEffect(() => {
    syncRunningRef.current?.();
  }, [shouldRun]);

  useEffect(() => {
    rendererRef.current?.setPalette(palette);
  }, [palette]);

  useEffect(() => {
    rendererRef.current?.setParams(params);
  }, [params]);

  const isFailed = isStrict && mode === 'failed';
  const isShaderVisible = shouldRun && mode === 'shader';
  const isSvgVisible =
    isPaused || (!isStrict && (mode === 'fallback' || isTooSlow));

  useEffect(() => {
    const state =
      (isFailed && `FAILED: ${failure}`) ||
      (isPaused && 'svg (source: svg)') ||
      (isTooSlow && 'svg (too slow for the shader)') ||
      (mode === 'fallback' && `svg (${failure ?? 'shader slow to start'})`) ||
      (mode === 'shader' && 'shader') ||
      'starting';
    setLiquidStatus({ state, level });
  }, [isFailed, isPaused, isTooSlow, mode, failure, level]);

  const BlobSVG = isDark ? BlobDarkSVG : BlobLightSVG;

  return (
    <>
      {isFailed && (
        <ShaderFailed>
          <ShaderFailedLabel>shader failed: {failure}</ShaderFailedLabel>
        </ShaderFailed>
      )}
      <BlobAnchor aria-hidden>
        <BlobRotation>
          <BlobArt
            $visible={isSvgVisible}
            $animated={isSvgVisible && !isReducedMotion}
            $fadeMs={params.fadeInMs}
          >
            <BlobSVG />
          </BlobArt>
          <BlobArt
            ref={canvasSlotRef}
            $visible={isShaderVisible}
            $fadeMs={params.fadeInMs}
            $blurPx={params.blur ? params.blurPx : 0}
          />
        </BlobRotation>
      </BlobAnchor>
    </>
  );
};
