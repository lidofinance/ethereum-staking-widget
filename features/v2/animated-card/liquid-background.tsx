import { useEffect, useRef, useState } from 'react';
import { useThemeToggle } from '@lidofinance/lido-ui';

import { ReactComponent as BlobDarkSVG } from './assets/blob-dark.svg';
import { ReactComponent as BlobLightSVG } from './assets/blob-light.svg';
import { useLiquidParams } from './liquid-params';
import {
  createLiquidRenderer,
  type BlobPalette,
  type LiquidRenderer,
  type RGB,
} from './liquid-renderer';
import { BlobAnchor, BlobArt, BlobRotation } from './styles';
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

type Mode = 'pending' | 'shader' | 'fallback';

/**
 * Liquid blob behind the top of the card. Starts transparent and fades in
 * once a source is ready: the shader after its first frames are drawn, or
 * the Figma SVG when WebGL is unavailable, slow to start, or its context is
 * lost (drifting with CSS). Reduced motion gets the still SVG.
 */
export const LiquidBackground = () => {
  const { themeName } = useThemeToggle();
  const isDark = themeName === 'dark';
  const palette = isDark ? PALETTES.dark : PALETTES.light;
  const params = useLiquidParams();

  const isReducedMotion = usePrefersReducedMotion();
  // `svg` only pauses the shader, so switching back is instant
  const isShaderPaused = params.source === 'svg';
  const [mode, setMode] = useState<Mode>('pending');

  const canvasSlotRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<LiquidRenderer | null>(null);
  const syncRunningRef = useRef<(() => void) | null>(null);
  const paletteRef = useRef(palette);
  paletteRef.current = palette;
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const isShaderPausedRef = useRef(isShaderPaused);
  isShaderPausedRef.current = isShaderPaused;

  useEffect(() => {
    const slot = canvasSlotRef.current;
    if (isReducedMotion || !slot) {
      setMode('fallback');
      return;
    }

    // a fresh canvas per renderer: destroy() loses the WebGL context, and a
    // canvas with a lost context hands the dead context back forever
    const canvas = document.createElement('canvas');
    slot.appendChild(canvas);

    const renderer = createLiquidRenderer(canvas, {
      palette: paletteRef.current,
      params: paramsRef.current,
      onReady: () => setMode('shader'),
      onError: () => setMode('fallback'),
    });
    if (!renderer) {
      canvas.remove();
      setMode('fallback');
      return;
    }
    rendererRef.current = renderer;

    const fallbackTimer = setTimeout(
      () =>
        setMode((current) => (current === 'pending' ? 'fallback' : current)),
      FALLBACK_DELAY_MS,
    );

    let isContextLost = false;
    const onContextLost = (event: Event) => {
      event.preventDefault();
      isContextLost = true;
      renderer.stop();
      setMode('fallback');
    };
    canvas.addEventListener('webglcontextlost', onContextLost);

    // frames only while the card is on screen and the shader is wanted
    let isOnScreen = false;
    const syncRunning = () => {
      if (isOnScreen && !isShaderPausedRef.current && !isContextLost) {
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
    };
  }, [isReducedMotion]);

  useEffect(() => {
    syncRunningRef.current?.();
  }, [isShaderPaused]);

  useEffect(() => {
    rendererRef.current?.setPalette(palette);
  }, [palette]);

  useEffect(() => {
    rendererRef.current?.setParams(params);
  }, [params]);

  const isSvgVisible =
    isShaderPaused || (params.source === 'auto' && mode === 'fallback');
  const isShaderVisible = !isShaderPaused && mode === 'shader';

  const BlobSVG = isDark ? BlobDarkSVG : BlobLightSVG;

  return (
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
  );
};
