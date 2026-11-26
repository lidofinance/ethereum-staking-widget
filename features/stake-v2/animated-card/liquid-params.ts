import { useSyncExternalStore } from 'react';

export type LiquidSource = 'auto' | 'shader' | 'svg';
export type LiquidQuality = 'auto' | 'high' | 'medium' | 'low';

export type LiquidParams = {
  /** shader seconds per real second */
  speed: number;
  /** seconds for the motion to ease up to full speed after boot */
  speedRamp: number;
  /** peak opacity of the blob */
  intensity: number;
  /** field value where the blob's edge sits: lower = bigger blob */
  threshold: number;
  /** half-width of the soft edge around `threshold`, in field units */
  softness: number;
  /** how far the noise pushes the outline, px */
  warpAmount: number;
  /** size of the noise features, px */
  warpScale: number;
  /** weight of the hanging tendrils relative to the top band */
  tendrils: number;
  /** orbit radius of each ball, fraction of its radius */
  drift: number;
  /** fade-out band at the canvas edge, px */
  edgeFade: number;
  /** moves the whole blob down (positive) or up (negative), px */
  offsetY: number;
  /** stretches the blob's layout down from its top band, keeping its look */
  scaleY: number;
  /** canvas buffer scale; the blob is soft, so low is cheap and invisible */
  resolution: number;
  /** all softening: off draws the bare shape with a hard edge */
  blur: boolean;
  /** police lights: the blob flashes red and blue, shader only */
  gtaMode: boolean;
  /** extra CSS blur on the shader canvas, on top of `softness` */
  blurPx: number;
  /** max shader frames per second, 0 for the display rate */
  maxFps: number;
  /** `auto` steps down on slow devices; the others pin a level */
  quality: LiquidQuality;
  /** boot fade-in and shader/SVG cross-fade, ms */
  fadeInMs: number;
  /**
   * `auto` is the production behaviour. `shader` disables every fallback
   * and paints the card red on failure; `svg` pauses the shader.
   */
  source: LiquidSource;
};

export const DEFAULT_LIQUID_PARAMS: LiquidParams = {
  speed: 1.65,
  speedRamp: 3.2,
  intensity: 0.38,
  threshold: 0.76,
  softness: 0.55,
  warpAmount: 162,
  warpScale: 125,
  tendrils: 1.25,
  drift: 0.46,
  edgeFade: 130,
  offsetY: 0,
  scaleY: 1,
  resolution: 0.25,
  blur: true,
  gtaMode: false,
  blurPx: 20,
  maxFps: 30,
  quality: 'auto',
  fadeInMs: 600,
  source: 'auto',
};

// Tuning store for the controls panel. Kept in localStorage so the values
// survive reloads.

const STORAGE_KEY = 'v2-liquid-params';

const load = (): LiquidParams => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LIQUID_PARAMS;
    const stored: Partial<LiquidParams> = JSON.parse(raw);
    // only known keys, so a renamed param does not linger in the output
    return Object.fromEntries(
      Object.entries(DEFAULT_LIQUID_PARAMS).map(([key, value]) => [
        key,
        stored[key as keyof LiquidParams] ?? value,
      ]),
    ) as LiquidParams;
  } catch {
    return DEFAULT_LIQUID_PARAMS;
  }
};

let current: LiquidParams | null = null;
const listeners = new Set<() => void>();

const getSnapshot = () => (current ??= load());
const getServerSnapshot = () => DEFAULT_LIQUID_PARAMS;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const setLiquidParams = (patch: Partial<LiquidParams>) => {
  current = { ...getSnapshot(), ...patch };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // tuning still works for this page view
  }
  listeners.forEach((listener) => listener());
};

export const resetLiquidParams = () => {
  current = DEFAULT_LIQUID_PARAMS;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nothing stored
  }
  listeners.forEach((listener) => listener());
};

export const useLiquidParams = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
